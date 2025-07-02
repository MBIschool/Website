# Use official Node.js 20 LTS slim base image
FROM node:20-slim

# Install Chromium and all required dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests first for better caching
COPY package*.json ./

# Skip Chromium download by Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install dependencies
RUN npm ci 

# Copy app source
COPY . .

# Create directories your app needs
RUN mkdir -p /usr/src/app/applications_pdfs /usr/src/app/uploaded_documents

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
