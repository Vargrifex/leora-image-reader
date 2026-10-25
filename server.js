import express from "express";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 10000);
const host = "0.0.0.0";
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. The interface will load, but generation will not work until the key is added.");
}

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: "25mb" }));
app.use(express.static("public"));

const MASTER = `You are L’EORA Content Image Reader V1, an editorial image interpreter and phrase creator.

Read the uploaded image carefully. Build meaning only from what is actually visible and from optional user context. Do not invent personal facts.

VOICE: thoughtful, elegant, human, concise, cinematic, reflective, never generic motivational spam.

EAST × WEST MASTERCLASS LENS: synthesize Eastern themes such as observation, patience, adaptability, balance, discipline and simplicity with Western themes such as inquiry, agency, courage, responsibility, experimentation, meaning and creativity. Do not pretend the traditions are identical and do not attribute the synthesis to a historical thinker.

QUOTE RULE: The quote must be an ORIGINAL L’EORA quote. Never fabricate a quotation or attribute it to a historical person. Do not put quotation marks around a historical quote.

INLAY RULE: Keep inlay text very short, elegant and suitable for placement on an image. It may be a short phrase, not a paragraph.

HASHTAG RULE: Return exactly 5 hashtags. They must be relevant to the actual image and message. Prefer broadly useful/current-style tags; do not claim that a tag is trending in real time unless that can actually be verified.

L’EORA RULE: Transformation is the hero, not a product. Avoid hard selling, exaggerated promises and empty inspiration.

Return ONLY a JSON object with these keys:
interpretation, title, quote, inspiring_phrase, caption, inlay_text, hashtags, east_west_lens.
The hashtags value MUST be an array of exactly 5 strings, each beginning with #.`;

function cleanJson(text) {
  const trimmed = String(text || "").trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("The AI returned an invalid result. Please try again.");
  return JSON.parse(withoutFence.slice(start, end + 1));
}

function validateResult(data) {
  const keys = ["interpretation", "title", "quote", "inspiring_phrase", "caption", "inlay_text", "hashtags", "east_west_lens"];
  for (const key of keys) {
    if (!(key in data)) throw new Error(`Missing result field: ${key}`);
  }
  if (!Array.isArray(data.hashtags) || data.hashtags.length !== 5) {
    throw new Error("The AI did not return exactly 5 hashtags. Please try again.");
  }
  data.hashtags = data.hashtags.map(h => {
    const s = String(h).trim();
    return s.startsWith("#") ? s : `#${s.replace(/^#+/, "")}`;
  });
  return data;
}

app.get("/health", (_req, res) => res.json({ ok: true, app: "L’EORA Content Image Reader V1" }));

app.post("/api/generate", async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: "The AI connection is not configured yet. Add OPENAI_API_KEY in the server environment, then redeploy." });

    const { imageDataUrl, context = "" } = req.body || {};
    if (!imageDataUrl || typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
      return res.status(400).json({ error: "Please choose a valid image first." });
    }

    const response = await client.responses.create({
      model,
      instructions: MASTER,
      input: [{
        role: "user",
        content: [
          { type: "input_text", text: `Optional user context: ${context || "None"}\n\nInterpret this image and create the complete L’EORA package.` },
          { type: "input_image", image_url: imageDataUrl, detail: "auto" }
        ]
      }]
    });

    const data = validateResult(cleanJson(response.output_text));
    res.json(data);
  } catch (err) {
    console.error(err);
    const message = err?.message || "Generation failed. Please try again.";
    res.status(500).json({ error: message });
  }
});

app.listen(port, host, () => {
  console.log(`L’EORA Image Reader running on ${host}:${port}`);
});
