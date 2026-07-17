# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi (termasuk devDependencies untuk build)
RUN npm ci --legacy-peer-deps

# Salin sisa kode program
COPY . .

# Build aplikasi NestJS menjadi JavaScript di folder dist
RUN npm run build

# Stage 2: Run the production application
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Salin package.json dan package-lock.json untuk install dependensi produksi saja
COPY package*.json ./

# Install hanya dependensi produksi
RUN npm ci --omit=dev --legacy-peer-deps

# Salin build dari stage builder
COPY --from=builder /usr/src/app/dist ./dist

# Salin folder public (jika ada aset statis atau upload lokal)
COPY --from=builder /usr/src/app/public ./public

# Expose port aplikasi (sesuai dengan PORT di .env, default 3001)
EXPOSE 3001

# Jalankan aplikasi
CMD ["node", "dist/main"]
