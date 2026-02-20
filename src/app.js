import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import { marked } from "marked";
import path from "path";
import { fileURLToPath } from "url";

// Try to set FONTCONFIG_PATH from common Homebrew/system locations before
// loading the `canvas` native bindings which rely on fontconfig.
const fontconfigDirs = [
  "/opt/homebrew/etc/fonts",
  "/usr/local/etc/fonts",
  "/etc/fonts",
];

for (const d of fontconfigDirs) {
  try {
    if (fs.existsSync(d)) {
      process.env.FONTCONFIG_PATH = d;
      console.log(`Set FONTCONFIG_PATH=${d}`);
      break;
    }
  } catch (e) {
    // ignore
  }
}

// Dynamically import canvas after ensuring FONTCONFIG_PATH is set.
const { createCanvas, loadImage, registerFont } = await import("canvas");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const WIDTH = 1080;
const HEIGHT = 1350;
const PADDING_X = 80;
const TITLE_Y = 160;
const DESCRIPTION_Y = 420;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to register a local/system font that supports accents/UTF-8.
// If none found, fallback to generic Sans (may produce missing glyphs).
let FONT_FAMILY = "Sans";
const possibleFonts = [
  path.join(__dirname, "fonts", "NotoSans-Regular.ttf"),
  path.join(__dirname, "fonts", "DejaVuSans.ttf"),
  "/Library/Fonts/Arial Unicode.ttf",
  "/Library/Fonts/Arial.ttf",
];

for (const fp of possibleFonts) {
  try {
    if (fs.existsSync(fp)) {
      try {
        registerFont(fp, { family: "AppFont" });
        FONT_FAMILY = "AppFont";
        console.log(`Registered font: ${fp}`);
        break;
      } catch (err) {
        console.warn(`registerFont failed for ${fp}: ${err.message}`);
      }
    }
  } catch (err) {
    console.warn(`Font check failed for ${fp}: ${err.message}`);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function drawMarkdown(ctx, markdown, startY, fontSize, lineHeight) {
  const tokens = marked.lexer(markdown);
  let y = startY;

  for (const token of tokens) {
    if (token.type === "heading") {
      ctx.font = `bold ${fontSize}px "${FONT_FAMILY}"`;
      wrapText(
        ctx,
        token.text,
        PADDING_X,
        y,
        WIDTH - PADDING_X * 2,
        lineHeight,
      );
      y += lineHeight * 2;
    }

    if (token.type === "paragraph") {
      ctx.font = `${fontSize - 20}px "${FONT_FAMILY}"`;
      wrapText(
        ctx,
        token.text,
        PADDING_X,
        y,
        WIDTH - PADDING_X * 2,
        lineHeight,
      );
      y += lineHeight * 2;
    }

    if (token.type === "list") {
      ctx.font = `${fontSize - 20}px "${FONT_FAMILY}"`;
      for (const item of token.items) {
        wrapText(
          ctx,
          `• ${item.text}`,
          PADDING_X,
          y,
          WIDTH - PADDING_X * 2,
          lineHeight,
        );
        y += lineHeight;
      }
      y += lineHeight;
    }
  }
}

app.post("/generate-image", async (req, res) => {
  try {
    const {
      titleMarkdown,
      descriptionMarkdown,
      imagePath: bodyImagePath,
      imageName,
    } = req.body;

    // Prioridad: `imageName` en body > `imagePath` en body > imagen por defecto
    let imagePath = bodyImagePath || "./images/novedades.png";
    if (imageName) {
      imagePath = path.join("./images", imageName);
    }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    const baseImage = await loadImage(imagePath);
    ctx.drawImage(baseImage, 0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#FFFFFF";

    drawMarkdown(ctx, titleMarkdown, TITLE_Y, 72, 80);
    drawMarkdown(ctx, descriptionMarkdown, DESCRIPTION_Y, 48, 46);

    const buffer = canvas.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating image" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Image generator running on http://localhost:${PORT}`);
});
