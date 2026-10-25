# L’EORA Content Image Reader V1.1

A beginner-friendly phone web app: upload an image, let the AI interpret what is visible, and generate a L’EORA content package.

## Generates
- Image interpretation
- Title
- Original L’EORA quote
- Inspiring phrase
- Caption
- Optional inlay text
- Exactly 5 relevant hashtags
- East × West lens

## Deploy on Render
1. Put this folder in a GitHub repository.
2. In Render, choose **New > Web Service** and connect the repository.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variable `OPENAI_API_KEY` with your API key. Never put the key in `public/index.html` or commit it to GitHub.
6. Optional: `OPENAI_MODEL=gpt-4.1-mini`.
7. Deploy. Render will provide an `onrender.com` URL.

The server binds to `0.0.0.0` and uses Render's `PORT` environment variable, with 10000 as the local default.

## Local test
```bash
npm install
OPENAI_API_KEY="your_key" npm start
```
Then open `http://localhost:10000`.

## Important
Hashtags are relevant/current-style suggestions, not a guarantee of real-time trending status. Real-time trend verification can be added in a later version.
