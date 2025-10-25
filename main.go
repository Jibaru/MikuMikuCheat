package main

import (
	"context"
	"embed"
	"fmt"
	"runtime"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed icon.ico
var icon []byte

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Start system tray in a goroutine
	go func() {
		systray.Run(app.onSystrayReady, app.onSystrayExit)
	}()

	// Base options
	appOptions := &options.App{
		Title:  "39coach",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 0},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Frameless:        false, // IMPORTANTE: Sin marco para evitar el "fantasma" al arrastrar
		Bind: []interface{}{
			app,
		},
		// Windows options with transparency enabled
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			DisableWindowIcon:    false,
			BackdropType:         windows.Mica,
		},
	}

	// Create application with options
	err := wails.Run(appOptions)

	if err != nil {
		println("Error:", err.Error())
	}
}

// App struct
type App struct {
	ctx         context.Context
	mShow       *systray.MenuItem
	mHide       *systray.MenuItem
	mQuit       *systray.MenuItem
	isMinimized bool
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		isMinimized: false,
	}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Set window protection based on OS
	if runtime.GOOS == "windows" {
		setWindowsDisplayAffinity(ctx)
		// Hide from taskbar initially
		hideFromTaskbarWails(ctx)
		// Set always on top
		setAlwaysOnTopWails(ctx)
		// Set window transparency/opacity
		setWindowOpacityWails(ctx, 230)
	}
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	systray.Quit()
}

// onSystrayReady is called when systray is ready
func (a *App) onSystrayReady() {
	systray.SetIcon(icon)
	systray.SetTitle("39coach")
	systray.SetTooltip("39coach - Coaching Application")

	a.mShow = systray.AddMenuItem("Mostrar", "Mostrar ventana")
	a.mHide = systray.AddMenuItem("Ocultar", "Ocultar ventana")
	systray.AddSeparator()
	a.mQuit = systray.AddMenuItem("Salir", "Cerrar aplicación")

	// Handle menu clicks
	go func() {
		for {
			select {
			case <-a.mShow.ClickedCh:
				if a.ctx != nil {
					a.isMinimized = false
					wailsruntime.WindowShow(a.ctx)
					// Re-enable always on top when showing
					if runtime.GOOS == "windows" {
						setAlwaysOnTopWails(a.ctx)
					}
				}
			case <-a.mHide.ClickedCh:
				if a.ctx != nil {
					a.isMinimized = true
					wailsruntime.WindowHide(a.ctx)
				}
			case <-a.mQuit.ClickedCh:
				if a.ctx != nil {
					wailsruntime.Quit(a.ctx)
				}
				systray.Quit()
				return
			}
		}
	}()
}

// onSystrayExit is called when systray exits
func (a *App) onSystrayExit() {
	// Cleanup
}

// MinimizeWindow minimizes the window (can be called from frontend)
func (a *App) MinimizeWindow() {
	if a.ctx != nil {
		a.isMinimized = true
		wailsruntime.WindowHide(a.ctx)
	}
}

// RestoreWindow restores the window (can be called from frontend)
func (a *App) RestoreWindow() {
	if a.ctx != nil {
		a.isMinimized = false
		wailsruntime.WindowShow(a.ctx)
		if runtime.GOOS == "windows" {
			setAlwaysOnTopWails(a.ctx)
		}
	}
}

// SetOpacity sets the window opacity (0-100, where 100 is fully opaque)
func (a *App) SetOpacity(opacity int) {
	if a.ctx != nil && runtime.GOOS == "windows" {
		// Convert 0-100 to 0-255
		alpha := uint8((opacity * 255) / 100)
		setWindowOpacityWails(a.ctx, alpha)
	}
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
