package main

import (
	"39coach/internal/models"
	"embed"
	"os"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed icon.ico
var icon []byte

func main() {
	aiModel := models.NewOpenAIModel(os.Getenv("OPENAI_API_KEY"))

	app := NewApp(aiModel)

	// Start system tray in a goroutine
	go func() {
		systray.Run(app.onSystrayReady, app.onSystrayExit)
	}()

	err := wails.Run(&options.App{
		Title:  "39coach",
		Width:  500,
		Height: 600,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 200},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind: []interface{}{
			app,
		},
		Frameless: true,
		Mac: &mac.Options{
			TitleBar: &mac.TitleBar{
				TitlebarAppearsTransparent: true,
				HideTitle:                  true,
				HideTitleBar:               false,
				FullSizeContent:            true,
				UseToolbar:                 false,
				HideToolbarSeparator:       true,
			},
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			DisableWindowIcon:    false,
			BackdropType:         windows.Mica,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
