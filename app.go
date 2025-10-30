package main

import (
	"context"
	"runtime"

	"github.com/getlantern/systray"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx         context.Context
	mShow       *systray.MenuItem
	mHide       *systray.MenuItem
	mQuit       *systray.MenuItem
	isMinimized bool
}

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
		setWindowsDisplayAffinity()
		// Hide from taskbar initially
		hideFromTaskbarWails()
		// Set always on top
		setAlwaysOnTopWails()
		// Set window transparency/opacity
		setWindowOpacityWails(230)
	}
}

// Quit cierra la aplicación
func (a *App) Quit() {
	wailsruntime.Quit(a.ctx)
}

// shutdown is called when the app is closing
func (a *App) shutdown(ctx context.Context) {
	systray.Quit()
}

// onSystrayReady is called when systray is ready
func (a *App) onSystrayReady() {
	systray.SetIcon(icon)
	systray.SetTitle("MikuMikuCheat")
	systray.SetTooltip("MikuMikuCheat")

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
						setAlwaysOnTopWails()
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
			setAlwaysOnTopWails()
		}
	}
}

// SetOpacity sets the window opacity (0-100, where 100 is fully opaque)
func (a *App) SetOpacity(opacity int) {
	if a.ctx != nil && runtime.GOOS == "windows" {
		// Convert 0-100 to 0-255
		alpha := uint8((opacity * 255) / 100)
		setWindowOpacityWails(alpha)
	}
}
