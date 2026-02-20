import bodyParser from "body-parser";
import { createCanvas, loadImage } from "canvas";
import express from "express";
import { marked } from "marked";
import path from "path";

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const WIDTH = 1080;
const HEIGHT = 1350;
const PADDING_X = 80;
const TITLE_Y = 160;
const DESCRIPTION_Y = 420;

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
      ctx.font = `bold ${fontSize}px Sans`;
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
      ctx.font = `${fontSize - 20}px Sans`;
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
      ctx.font = `${fontSize - 20}px Sans`;
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

app.post("/generate-image/:imageName?", async (req, res) => {
  try {
    const {
      titleMarkdown,
      descriptionMarkdown,
      imagePath: bodyImagePath,
    } = req.body;
    const { imageName } = req.params;

    // Prioridad: parámetro de ruta `imageName` > `imagePath` en body > imagen por defecto
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

app.listen(3000, () => {
  console.log("🚀 Image generator running on http://localhost:3000");
});
