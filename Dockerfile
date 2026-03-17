# syntax=docker/dockerfile:1

########################################
# 🏗️ STAGE 1: BUILD
########################################
FROM node:20-alpine AS builder

# Dependencias de build (pesadas)
RUN apk add --no-cache \
    build-base \
    python3 \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

WORKDIR /app

# Copiamos dependencias primero (mejor cache)
COPY package.json ./
COPY package-lock.json* ./

# Instalamos TODO (incluyendo dev si hiciera falta compilar)
RUN npm ci

# Copiamos código
COPY . .

# Si tienes build step (TypeScript, etc), aquí:
# RUN npm run build


########################################
# 🚀 STAGE 2: RUNTIME (LIGERO)
########################################
FROM node:20-alpine

# SOLO dependencias necesarias en runtime
RUN apk add --no-cache \
    ffmpeg \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    fontconfig \
    ttf-dejavu \
    ttf-liberation

# Validación crítica (evita tu bug en prod)
RUN ls -l /etc/fonts && \
    fc-cache -f -v && \
    fc-list | head

WORKDIR /app

# Copiamos solo lo necesario desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3000

CMD ["node", "src/app.js"]