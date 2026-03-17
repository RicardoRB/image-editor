# FFmpeg Editor API

A Node.js API for processing and transforming media using local FFmpeg. This project provides an endpoint to generate images with text overlays from Markdown content.

## Features

- Generate images with Markdown-formatted titles and descriptions
- Support for custom background images
- Uses FFmpeg for media processing
- Built with Express.js and Node Canvas
- Dockerized for easy deployment

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose
- FFmpeg (installed via Docker)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RicardoRB/image-editor.git
   cd image-editor
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running with Docker Compose

1. Build and start the service:

   ```bash
   docker-compose up --build
   ```

2. The API will be available at `http://localhost:3000`

## Running Locally

1. Ensure FFmpeg is installed on your system.

2. Start the server:

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

## API Usage

### Generate Image

**Endpoint:** `POST /generate-image`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "titleMarkdown": "# Your Title",
  "descriptionMarkdown": "Your description in **Markdown** format.",
  "imageName": "background.png"  // Optional: name of image in ./images/ folder
}
```

**Response:** PNG image file

#### Curl Example

```bash
curl -X POST http://localhost:3000/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "titleMarkdown": "# Hello World",
    "descriptionMarkdown": "This is a **sample** description.",
    "imageName": "novedades.png"
  }' \
  --output generated-image.png
```

This will generate an image with the title and description overlaid on the specified background image and save it as `generated-image.png`.

## Project Structure

- `src/app.js` - Main application file
- `fonts/` - Font files for text rendering
- `images/` - Background images
- `Dockerfile` - Docker image configuration
- `docker-compose.yml` - Docker Compose setup

## Dependencies

- Express.js - Web framework
- Node Canvas - Image manipulation
- Marked - Markdown parsing
- Body-parser - JSON parsing

## License

MIT
