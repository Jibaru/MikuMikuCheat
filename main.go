package main

import (
	"embed"
	"log"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"MikuMikuCheat/internal/ai/groq"
	"MikuMikuCheat/internal/ai/openai"
	"MikuMikuCheat/internal/config"
	"MikuMikuCheat/internal/services"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed icon.ico
var icon []byte

func main() {
	cfg, err := config.LoadConfig("config.json")
	if err != nil {
		log.Fatal("Error loading config:", err)
	}

	var (
		transcriptionClient services.TranscriptionClient
		responsesClient     services.ResponsesClient
		imageClient         services.ImageClient
	)

	switch cfg.AI.Transcribe.Provider {
	case "groq":
		transcriptionClient = groq.NewClient(cfg.AI.Transcribe.ApiKey, cfg.AI.Transcribe.Model)
	case "openai":
		transcriptionClient = openai.NewClient(cfg.AI.Transcribe.ApiKey, "", cfg.AI.Transcribe.Model, "")
	}

	switch cfg.AI.Generate.Provider {
	case "openai":
		responsesClient = openai.NewClient(cfg.AI.Generate.ApiKey, cfg.AI.Generate.Model, "", "")
	}

	switch cfg.AI.Image.Provider {
	case "openai":
		imageClient = openai.NewClient(cfg.AI.Image.ApiKey, "", "", cfg.AI.Image.Model)
	}

	app := NewApp()
	cheaterService := services.NewCheaterService(transcriptionClient, responsesClient, imageClient)

	// Start system tray in a goroutine
	go func() {
		systray.Run(app.onSystrayReady, app.onSystrayExit)
	}()

	err = wails.Run(&options.App{
		Title:  "MikuMikuCheat",
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
			cheaterService,
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
		log.Fatal("Error starting app:", err)
	}
}
