package config

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/go-playground/validator/v10"
)

// Config is the top-level structure, matching the root of the JSON.
type Config struct {
	AI      AIConfig      `json:"ai" validate:"required"`
	Context ContextConfig `json:"context" validate:"required"`
}

// AIConfig holds the nested "transcribe" and "generate" objects.
type AIConfig struct {
	Transcribe ServiceConfig `json:"transcribe" validate:"required"`
	Generate   ServiceConfig `json:"generate" validate:"required"`
	Image      ServiceConfig `json:"image" validate:"required"`
}

// ContextConfig holds information about personal context.
type ContextConfig struct {
	Path string `json:"path"`
}

// ServiceConfig defines the common structure for a service,
// containing "provider" and "model".
type ServiceConfig struct {
	Provider string `json:"provider" validate:"required,oneof=groq openai"`
	Model    string `json:"model" validate:"required,min=1"`
	ApiKey   string `json:"apiKey" validate:"required,min=1"`
}

// ParseConfig takes a byte slice of JSON data and unmarshals it
// into a Config struct.
func ParseConfig(data []byte) (Config, error) {
	var config Config

	if err := json.Unmarshal(data, &config); err != nil {
		return Config{}, fmt.Errorf("failed to parse config JSON: %w", err)
	}

	return config, nil
}

// ValidateConfig checks the business rules for a parsed Config.
func ValidateConfig(c Config) error {
	v := validator.New()
	return v.Struct(c)
}

func LoadConfig(filename string) (Config, error) {
	file, err := os.Open(filename)
	if err != nil {
		return Config{}, fmt.Errorf("failed to open config file: %w", err)
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		return Config{}, fmt.Errorf("failed to stat config file: %w", err)
	}

	data := make([]byte, stat.Size())
	_, err = file.Read(data)
	if err != nil {
		return Config{}, fmt.Errorf("failed to read config file: %w", err)
	}

	config, err := ParseConfig(data)
	if err != nil {
		return Config{}, err
	}

	if err := ValidateConfig(config); err != nil {
		return Config{}, err
	}

	return config, nil
}
