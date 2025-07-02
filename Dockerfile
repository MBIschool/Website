# Use a slim Node.js image as the base
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Google Chrome Stable and other dependencies required by Puppeteer
# Note: This is a more robust way to ensure a compatible Chromium version.
RUN apt-get update && apt-get install -y gnupg wget \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
        google-chrome-stable \
        fontconfig \
        fonts-ipafont-gothic \
        fonts-wqy-zenhei \
        fonts-thai-tlwg \
        fonts-kacst \
        --no-install-recommends \
        && rm -rf /var/lib/apt/lists/* \
        && rm -rf /etc/apt/keyrings/google-chrome.gpg # Clean up the key after use

# Skip Puppeteer's automatic Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Point Puppeteer to the Google Chrome executable
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (default for Cloud Run is 8080)
EXPOSE 8080

# Start your Node.js application
CMD [ "node", "server.js" ]