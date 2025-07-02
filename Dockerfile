# Use a slim Node.js image as the base
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies required by Puppeteer's downloaded Chromium.
# This ensures that Puppeteer's own browser can run correctly in a minimal environment.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libu2f-udev \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxshmfence6 \
    libxkbcommon0 \
    xdg-utils \
    # Basic fonts often needed for rendering
    fontconfig \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# NO PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ENV VAR HERE
# NO PUPPETEER_EXECUTABLE_PATH ENV VAR HERE

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install Node.js dependencies. Puppeteer will download Chromium during this step.
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (default for Cloud Run is 8080)
EXPOSE 8080

# Start your Node.js application
CMD [ "node", "server.js" ]