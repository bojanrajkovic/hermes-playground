package store

import (
	"encoding/json"
	"fmt"
	"os"
)

// Carrier mirrors one entry of config/carriers.json.
type Carrier struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	BaseCents  int     `json:"baseCents"`
	PerKgCents int     `json:"perKgCents"`
	MaxKg      float64 `json:"maxKg"`
}

// LoadCarriers reads the carrier list from a JSON file.
func LoadCarriers(path string) ([]Carrier, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read carriers: %w", err)
	}
	var doc struct {
		Carriers []Carrier `json:"carriers"`
	}
	if err := json.Unmarshal(data, &doc); err != nil {
		return nil, fmt.Errorf("parse carriers: %w", err)
	}
	return doc.Carriers, nil
}
