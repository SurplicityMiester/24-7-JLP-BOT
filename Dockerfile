FROM eclipse-temurin:17-jdk

RUN apt-get update && apt-get install -y curl wget netcat-openbsd && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app
COPY . .
RUN npm install

CMD ["bash", "start.sh"]