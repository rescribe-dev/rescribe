#!/bin/bash

# display x11 ubuntu in windows wsl

set -e

export DISPLAY=:0

Xvfb :0 -screen 0 1920x1080x24 +extension GLX -nolisten tcp -dpi 96 & display_pid=$!
x11vnc -safer -localhost -usepw -shared -forever -repeat -no6 -display :0 -rfbport 5900 & x11_pid=$!

echo "display: $display_pid, x11: $x11_pid"
