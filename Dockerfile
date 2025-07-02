## Use a slim Node.js image as the base for smaller size
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install a comprehensive list of system dependencies required by Puppeteer's downloaded Chromium.
# This list aims to cover most common requirements across various Linux environments for headless Chrome.
# We remove 'libxshmfence6' as it was causing 'Unable to locate package' error on 'bookworm'.
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
    libvulkan1 \ 
    # Added for broader compatibility, often implicitly needed
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxkbcommon0 \
    xdg-utils \
    # Basic fonts often needed for rendering PDFs correctly
    fontconfig \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    # Clean up apt caches to reduce image size
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# IMPORTANT: Do NOT set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Do NOT set PUPPETEER_EXECUTABLE_PATH here.
# Let Puppeteer download and manage its compatible Chromium.

# Copy package.json and package-lock.json to the working directory
# This is done before npm ci to leverage Docker's build cache
COPY package*.json ./

# Install Node.js dependencies. Puppeteer will download Chromium during this step.
# This is where the large Chromium binary will be fetched into node_modules.
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (default for Cloud Run is 8080)
EXPOSE 8080

# Start your Node.js application
CMD [ "node", "server.js" ]