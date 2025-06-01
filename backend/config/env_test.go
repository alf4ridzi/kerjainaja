package config

import "testing"

func TestEnv(t *testing.T) {
	content := Env("TEST")
	t.Log(content)
}
