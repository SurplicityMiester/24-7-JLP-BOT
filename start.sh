#!/bin/bash

echo "Working directory: $(pwd)"

if [ ! -f /app/Lavalink.jar ]; then
  echo "Downloading Lavalink..."
  wget -O /app/Lavalink.jar https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar
fi

echo "Starting Lavalink..."
java -jar /app/Lavalink.jar 2>&1 | tee /tmp/lavalink.log &

echo "Waiting for Lavalink..."
for i in $(seq 1 30); do
  if nc -z localhost 2333 2>/dev/null; then
    echo "Lavalink ready after ${i} checks"
    break
  fi
  echo "Check $i: not ready yet..."
  sleep 2
done

echo "Extra buffer..."
sleep 5

echo "Starting bot..."
node index.js