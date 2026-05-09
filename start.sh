#!/bin/bash

echo "Working directory: $(pwd)"
echo "Files present: $(ls -la)"

# Download Lavalink if not present
if [ ! -f /app/Lavalink.jar ]; then
  echo "Downloading Lavalink..."
  wget -O /app/Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
  echo "Download complete. File size: $(du -h /app/Lavalink.jar)"
else
  echo "Lavalink.jar already exists"
fi

echo "Java version:"
java -version

echo "Starting Lavalink..."
java -jar /app/Lavalink.jar &

echo "Waiting for Lavalink on port 2333..."
until curl -s http://localhost:2333 > /dev/null 2>&1; do
  sleep 2
done

echo "Lavalink is up! Starting bot..."
node index.js