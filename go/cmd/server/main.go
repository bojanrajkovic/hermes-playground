package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/bojanrajkovic/hermes-playground/go/internal/store"
)

func main() {
	st := store.New()
	st.Put(store.Shipment{ID: "shp_1001", Carrier: "northwind", Status: "in_transit"})

	mux := http.NewServeMux()
	mux.HandleFunc("GET /shipments", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, st.List())
	})
	mux.HandleFunc("GET /shipments/{id}", func(w http.ResponseWriter, r *http.Request) {
		sh, err := st.Get(r.PathValue("id"))
		if errors.Is(err, store.ErrNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": err.Error()})
			return
		}
		writeJSON(w, http.StatusOK, sh)
	})

	addr := os.Getenv("PARCEL_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("encode response: %v", err)
	}
}
