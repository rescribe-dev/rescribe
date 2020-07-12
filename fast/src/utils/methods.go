package utils

// FindInArray find in array of strings
func FindInArray(target string, arr []string) bool {
	for _, b := range arr {
		if b == target {
			return true
		}
	}
	return false
}

var validBoolStr = []string{"true", "false"}

// ValidBool checks if string is a valid boolean
func ValidBool(input string) bool {
	return FindInArray(input, validBoolStr)
}
