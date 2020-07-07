package utils

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Port the port for the server
var Port = 8084

// DefaultHost host name for default
var DefaultHost = "static.rescribe.dev"

// DefaultSecure use secure connection for default
var DefaultSecure = true

// PrerenderHost host name for prerender
var PrerenderHost = "localhost:8083"

// PrerenderSecure use secure connection for prerender
var PrerenderSecure = false

func contains(s []int, e int) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func handleBool(key string, def bool) (bool, error) {
	dataStr := os.Getenv(key)
	if len(dataStr) > 0 {
		if !ValidBool(dataStr) {
			return false, fmt.Errorf("invalid boolean provided for %s: %s", key, dataStr)
		}
		return dataStr == "true", nil
	}
	return def, nil
}

func handleInt(key string, def int) (int, error) {
	dataStr := os.Getenv(key)
	if len(dataStr) > 0 {
		data, err := strconv.Atoi(dataStr)
		if err != nil {
			return -1, fmt.Errorf("invalid int provided for %s: %s", key, dataStr)
		}
		return data, nil
	}
	return def, nil
}

func handleString(key string, def string) (string, error) {
	dataStr := os.Getenv(key)
	if len(dataStr) > 0 {
		return dataStr, nil
	}
	return def, nil
}

// LoadConfig load environment
func LoadConfig() error {
	err := godotenv.Load()
	if err != nil {
		// cannot find env file
		fmt.Println("cannot find .env file")
	}
	if debug, err = handleBool("DEBUG", debug); err != nil {
		return err
	}
	if Port, err = handleInt("PORT", Port); err != nil {
		return err
	}

	if DefaultHost, err = handleString("DEFAULT_HOST", DefaultHost); err != nil {
		return err
	}
	if DefaultSecure, err = handleBool("DEFAULT_SECURE", DefaultSecure); err != nil {
		return err
	}
	if PrerenderHost, err = handleString("PRERENDER_HOST", PrerenderHost); err != nil {
		return err
	}
	if PrerenderSecure, err = handleBool("PRERENDER_SECURE", PrerenderSecure); err != nil {
		return err
	}
	return nil
}
