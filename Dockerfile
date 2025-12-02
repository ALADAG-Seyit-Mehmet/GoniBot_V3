FROM node:18-slim

# Gerekli sistem kütüphanelerini yükle
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

# Sadece package.json'a bakarak temiz kurulum yap
RUN npm install

COPY . .

CMD ["node", "index.js"]