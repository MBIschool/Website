# Use a Node.js base image. node:20-slim is a good balance of size and features.
# You can adjust the Node.js version (e.g., node:18-slim) if needed.
FROM node:20-slim

# Set environment variables crucial for Puppeteer's operation in a Docker environment.
# PUPPETEER_EXECUTABLE_PATH: Directs Puppeteer to the system-installed Chromium.
# PUPPETEER_CACHE_DIR: Specifies a writable location for Puppeteer's internal cache.
# HOME: Some Chromium/Puppeteer internal logic might use the HOME directory;
#       setting it to our WORKDIR ensures it's writable and stable.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_CACHE_DIR=/usr/src/app/.cache/puppeteer \
    HOME=/usr/src/app \
    LANG=en_US.utf8 \
    LC_ALL=en_US.utf8

# 1. Install system dependencies required by Chromium (the browser Puppeteer controls).
# This is the most critical part for getting Puppeteer to work.
# 'chromium' is the actual browser package. The other packages are its common runtime dependencies.
# --no-install-recommends helps keep the image size down.
# rm -rf /var/lib/apt/lists/* cleans up apt cache to further reduce image size.
RUN apt-get update && apt-get install -y \
    chromium \
    fontconfig \
    locales \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    wget \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 2. Set the locale. This helps prevent warnings from Chromium regarding locale settings.
# We set LANG and LC_ALL in ENV above for clarity and consistency.
RUN localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

# 3. Set the working directory for your application inside the container.
WORKDIR /usr/src/app

# 4. Copy package.json and package-lock.json first.
# This optimizes Docker caching. If these files don't change,
# npm install/ci doesn't need to re-run on subsequent builds.
COPY package*.json ./

# 5. Install Node.js dependencies.
# npm ci is preferred in CI/CD (like Cloud Build) for consistent, reproducible builds.
# --omit=dev ensures devDependencies are not installed in the production image.
# Because PUPPETEER_EXECUTABLE_PATH is set, Puppeteer will not attempt to download
# its own Chromium, relying on the system-installed version.
RUN npm ci --omit=dev

# 6. Copy the rest of your application code into the working directory.
COPY . .

# 7. Expose the port your application listens on. Cloud Run expects port 8080 by default.
EXPOSE 8080

# 8. Define the command to run your application when the container starts.
# Ensure your server.js's puppeteer.launch() call includes args: ['--no-sandbox', '--disable-setuid-sandbox']
# as this is essential for running Chromium in a Docker container.
CMD [ "node", "server.js" ]