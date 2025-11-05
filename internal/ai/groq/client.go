package groq

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

const groqAPIURL = "https://api.groq.com/openai/v1/audio/transcriptions"

type Client struct {
	apiKey string
	model  string
}

func NewClient(apiKey string, model string) *Client {
	return &Client{apiKey: apiKey, model: model}
}

func (c *Client) TranscribeAudio(ctx context.Context, filePath string) (string, error) {
	type TranscriptionResponse struct {
		Text string `json:"text"`
	}

	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Prepare multipart form data
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	// Add file field
	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}
	if _, err := io.Copy(part, file); err != nil {
		return "", fmt.Errorf("failed to copy file: %w", err)
	}

	// Add other form fields
	writer.WriteField("model", c.model)
	writer.WriteField("temperature", "0")
	writer.WriteField("response_format", "json")
	writer.WriteField("language", "es")

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, groqAPIURL, &body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send request
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error: %s", string(respBody))
	}

	// Decode response
	var transcription TranscriptionResponse
	if err := json.NewDecoder(resp.Body).Decode(&transcription); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	return transcription.Text, nil
}
