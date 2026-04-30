FROM node:20-slim

# Instalar dependencias del sistema necesarias para Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurar Puppeteer para que use Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /usr/src/app

# Copiar solo los archivos de dependencias primero (para aprovechar caché)
COPY --chown=node:node package*.json ./

# Cambiar al usuario node (no root) por seguridad
USER node

# Instalar dependencias de Node.js
RUN npm install

# Copiar el resto del código fuente
COPY --chown=node:node . .

# Ejecutar la aplicación (CMD con shell si necesitas múltiples comandos)
CMD ["sh", "-c", "node src/index.js && ls dist"]