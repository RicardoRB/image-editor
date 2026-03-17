# syntax=docker/dockerfile:1
FROM node:20-alpine

# instalar ffmpeg, fontconfig, fuentes y dependencias para node-canvas
# incluye ttf-dejavu como fuente de fallback y fontconfig para evitar errores
RUN apk add --no-cache \
	ffmpeg \
	curl \
	build-base \
	python3 \
	cairo-dev \
	pango-dev \
	libjpeg-turbo-dev \
	giflib-dev \
	fontconfig \
	ttf-dejavu

# Ensure fontconfig config exists
RUN mkdir -p /etc/fonts && \
	if [ ! -f /etc/fonts/fonts.conf ]; then \
		echo '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>/usr/share/fonts</dir><dir>/app/fonts</dir></fontconfig>' > /etc/fonts/fonts.conf; \
	fi

# Build font cache
RUN fc-cache -f

WORKDIR /app

# copiar sólo archivos de lock/manifest para aprovechar cache
COPY package.json ./

# instalar solo producción (si necesitas dev deps en build o dev, ajustar)
RUN npm install --omit=dev

# copiar el resto del proyecto (node_modules está en .dockerignore)
COPY . .

EXPOSE 3000
ENV FONTCONFIG_PATH=/etc/fonts
CMD ["node", "src/app.js"]
