#!/bin/bash

echo "Working directory: $(pwd)"

if [ ! -f /app/Lavalink.jar ]; then
  echo "Downloading Lavalink..."
  wget -O /app/Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
fi

echo "Starting Lavalink..."
java -jar /app/Lavalink.jar &

echo "Waiting for Lavalink to be ready..."
sleep 20

echo "Starting bot..."
node index.js