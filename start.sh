#!/bin/bash

# Start Lavalink in the background
java -jar Lavalink.jar &
LAVALINK_PID=$!

echo "Waiting for Lavalink to be ready..."

# Wait until Lavalink is accepting connections on port 2333
until curl -s http://localhost:2333 > /dev/null 2>&1; do
  sleep 2
done

echo "Lavalink is up! Starting bot..."

# Start your bot (replace with your actual command)
node index.js

# If the bot exits, kill Lavalink too
kill $LAVALINK_PID