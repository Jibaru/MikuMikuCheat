package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github.com/getlantern/systray"
	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx         context.Context
	mShow       *systray.MenuItem
	mHide       *systray.MenuItem
	mQuit       *systray.MenuItem
	isMinimized bool

	aiModel AIModel
}

func NewApp(aiModel AIModel) *App {
	return &App{
		isMinimized: false,
		aiModel:     aiModel,
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

type AudioData struct {
	AudioBase64 string `json:"audioBase64"`
	MimeType    string `json:"mimeType"`
}

type GetAIResponse struct {
	AIResponse string `json:"aiResponse"`
	Error      string `json:"error,omitempty"`
}

type TranscribeAudioResponse struct {
	Transcription string `json:"transcription"`
	Error         string `json:"error,omitempty"`
}

func (a *App) TranscribeAudio(audioData AudioData) TranscribeAudioResponse {
	audioBytes, err := base64.StdEncoding.DecodeString(audioData.AudioBase64)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error decoding audio: %v", err),
		}
	}

	tempDir := os.TempDir()
	audioPath := filepath.Join(tempDir, fmt.Sprintf("audio_%d.webm", time.Now().Unix()))

	err = os.WriteFile(audioPath, audioBytes, 0644)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error saving audio: %v", err),
		}
	}
	defer os.Remove(audioPath)

	ctx := context.Background()
	transcription, err := a.aiModel.TranscribeAudio(ctx, audioPath)
	if err != nil {
		return TranscribeAudioResponse{
			Error: fmt.Sprintf("Error transcribing audio: %v", err),
		}
	}

	return TranscribeAudioResponse{
		Transcription: transcription,
	}

}

func (a *App) GetAIResponse(transcription string) GetAIResponse {
	ctx := context.Background()
	prompt := fmt.Sprintf("You are a helpful coaching assistant. Your response is exact, short and concise. Provide insights based on the following user input: %s", transcription)
	response, err := a.aiModel.GenerateResponse(ctx, prompt)
	if err != nil {
		return GetAIResponse{
			Error: fmt.Sprintf("Error generating AI response: %v", err),
		}
	}
	return GetAIResponse{
		AIResponse: response,
	}
}

// CheckAPIKeys verifica si las claves API están configuradas
func (a *App) CheckAPIKeys() map[string]bool {
	return map[string]bool{
		"openai":    os.Getenv("OPENAI_API_KEY") != "",
		"anthropic": os.Getenv("ANTHROPIC_API_KEY") != "",
	}
}

type AIModel interface {
	GenerateResponse(ctx context.Context, prompt string) (string, error)
	TranscribeAudio(ctx context.Context, filePath string) (string, error)
}
