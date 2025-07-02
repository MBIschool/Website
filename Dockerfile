# Use the official Node.js 20 LTS (Long Term Support) image as the base.
# This version is relatively new and compatible with recent Puppeteer.
# '-slim' versions are smaller and more suitable for production.
FROM node:20-slim

# Install system dependencies required by Chromium for headless operation.
# These are essential libraries that Chromium needs to run correctly in a minimal environment.
# '--no-install-recommends' helps keep the image size down by avoiding unnecessary packages.
RUN apt-get update && apt-get install -y \
    chromium \
    fontconfig \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm-dev \
    libgbm-dev \
    libnspr4 \
    libnss3 \
    libxcb-dri3-0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxshmfence-dev \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* # Clean up apt cache to reduce image size

# Set the working directory inside the container.
# All subsequent commands (COPY, RUN, CMD) will be relative to this directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if you have one) first.
# This allows Docker to cache the npm install step. If only your code changes,
# but not dependencies, this step won't be re-run on subsequent builds.
COPY package*.json ./

# Set an environment variable to tell Puppeteer to skip downloading Chromium.
# We're installing Chromium via apt-get, so Puppeteer doesn't need to download its own.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install Node.js dependencies.
# 'npm ci' is used for clean, reproducible builds in CI/CD environments.
# '--omit=dev' ensures development dependencies are not installed, keeping the image lean.
RUN npm ci --omit=dev

# Copy the rest of your application code into the container.
COPY . .

# Create the directories your application expects to write to.
# While files written here are ephemeral (won't persist across container restarts),
# pre-creating these directories ensures your app doesn't encounter permission issues
# or 'directory not found' errors at runtime when trying to write to them.
RUN mkdir -p /usr/src/app/applications_pdfs \
    && mkdir -p /usr/src/app/uploaded_documents

# Inform Docker that the container listens on port 8080.
# Cloud Run automatically finds the port your app listens on, but this is good practice.
EXPOSE 8080

# Define the command to run your application when the container starts.
# This matches the "start" script in your package.json.
CMD ["npm", "start"]