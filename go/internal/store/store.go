// Package store keeps shipments in memory for the demo server.
package store

import (
	"errors"
	"sort"
	"sync"
	"time"
)

// ErrNotFound is returned when a shipment ID is not in the store.
var ErrNotFound = errors.New("shipment not found")

// Shipment is the server-side view of a tracked parcel.
type Shipment struct {
	ID        string    `json:"id"`
	Carrier   string    `json:"carrier"`
	Status    string    `json:"status"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// Store is safe for concurrent use.
type Store struct {
	mu        sync.RWMutex
	shipments map[string]Shipment
}

// New returns an empty store.
func New() *Store {
	return &Store{shipments: make(map[string]Shipment)}
}

// Put inserts or replaces a shipment.
func (s *Store) Put(sh Shipment) {
	s.mu.Lock()
	defer s.mu.Unlock()
	sh.UpdatedAt = time.Now().UTC()
	s.shipments[sh.ID] = sh
}

// Get returns one shipment by ID.
func (s *Store) Get(id string) (Shipment, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	sh, ok := s.shipments[id]
	if !ok {
		return Shipment{}, ErrNotFound
	}
	return sh, nil
}

// List returns every shipment ordered by ID.
func (s *Store) List() []Shipment {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]Shipment, 0, len(s.shipments))
	for _, sh := range s.shipments {
		out = append(out, sh)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].ID < out[j].ID })
	return out
}
