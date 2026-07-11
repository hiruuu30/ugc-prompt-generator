// api/analyze-photo.js
//
// Server-side proxy for Gemini Vision.
// The Gemini API key lives ONLY in the Vercel environment variable
// GEMINI_API_KEY — it is never sent to or visible from the browser.

module.exports = async function handler(req, res) {
  // CORS (safe to leave open since no secret is ever exposed here;
  // tighten to your own domain if you want to be stricter)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { image, mediaType, instruction } = req.body || {};
    if (!image || !instruction) {
      res.status(400).json({ error: 'Missing image or instruction' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
      return;
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inline_data: { mime_type: mediaType || 'image/jpeg', data: image } },
                { text: instruction }
              ]
            }
          ]
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      res.status(502).json({ error: 'Gemini request failed: ' + errText });
      return;
    }

    const data = await geminiRes.json();
    const parts =
      (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map((p) => p.text || '').join('\n').trim();

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
