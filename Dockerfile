FROM node:20-alpine

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
	ttf-dejavu \
	ttf-liberation

RUN fc-cache -f

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "src/app.js"]