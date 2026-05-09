FROM eclipse-temurin:17-jdk

# Install Node.js
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy everything into the container
COPY . .

# Install bot dependencies
RUN npm install

# Run the startup script
CMD ["bash", "start.sh"]