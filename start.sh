#!/bin/bash

echo "Working directory: $(pwd)"

if [ ! -f /app/Lavalink.jar ]; then
  echo "Downloading Lavalink..."
  wget -O /app/Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
fi

mkdir -p /app/plugins

# Force re-download plugins on this deploy  ← ADD THIS HERE
rm -f /app/plugins/*.jar

if [ ! -f /app/plugins/lavasrc-plugin.jar ]; then
  echo "Downloading LavaSrc plugin..."
  wget -O /app/plugins/lavasrc-plugin.jar https://github.com/topi314/LavaSrc/releases/download/4.3.0/lavasrc-plugin-4.3.0.jar
fi

if [ ! -f /app/plugins/youtube-plugin.jar ]; then
  echo "Downloading YouTube Source plugin..."
  wget -O /app/plugins/youtube-plugin.jar https://github.com/lavalink-devs/youtube-source/releases/download/1.13.0/youtube-plugin-1.13.0.jar
fi

echo "Plugins present:"
ls -lh /app/plugins/

echo "Starting Lavalink..."
java -jar /app/Lavalink.jar &
LAVA_PID=$!

echo "Waiting for Lavalink..."
for i in $(seq 1 40); do
  if ! kill -0 $LAVA_PID 2>/dev/null; then
    echo "Lavalink process died at check $i"
    break
  fi
  if nc -z localhost 2333 2>/dev/null; then
    echo "Lavalink ready after ${i} checks"
    break
  fi
  echo "Check $i: not ready yet..."
  sleep 2
done

sleep 5
echo "Starting bot..."
node index.js