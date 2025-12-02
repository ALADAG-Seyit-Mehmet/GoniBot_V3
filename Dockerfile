# 1. Node.js'in resmi Linux sürümünü kullan
FROM node:18-slim

# 2. Resim işleme için gerekli Linux kütüphanelerini yükle (Garanti olsun)
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Çalışma klasörünü ayarla
WORKDIR /app

# 4. Paket listesini kopyala
COPY package.json ./

# 5. Kilit dosyasını (lockfile) kopyalama! (Windows ayarlarını getirmesin)
# Sadece modülleri sıfırdan kur
RUN npm install

# 6. Tüm dosyaları kopyala
COPY . .

# 7. Botu başlat
CMD ["node", "index.js"]