# Use Node LTS base
FROM node:20-bullseye-slim

# Install Chrome dependencies and Google Chrome stable
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    wget \
    gnupg \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install Google Chrome stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
      > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && apt-get install -y google-chrome-stable --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install deps (production)
COPY package*.json ./
RUN npm ci --production

# Copy app source
COPY . .

# Expose port
ENV PORT=4000
EXPOSE 4000

# Environment variables (you can override in Render)
ENV CHROME_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Optional healthcheck (curl must be available in image; kept out for smaller image)
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:4000/health || exit 1

# Start app
CMD ["node", "api/index.js"]
