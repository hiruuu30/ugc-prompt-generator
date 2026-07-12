// api/analyze-product.js
//
// Server-side proxy for Gemini text generation.
// Same pattern as analyze-photo.js: the Gemini API key lives ONLY in the
// Vercel environment variable GEMINI_API_KEY, never sent to the browser.
//
// Purpose: replace the old CATEGORY_INFO lookup-table approach. Instead of
// pulling generic "Home category" pain points for every home-category
// product, this asks Gemini to read the ACTUAL product name + scraped
// description and generate features/pain points/benefits/hook angle that
// are specific to that product.

const MODEL = 'gemini-flash-latest';

module.exports = async function handler(req, res) {
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
    const { productName, description, currentCategory, knownCategories } = req.body || {};
    if (!productName) {
      res.status(400).json({ error: 'Missing productName' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
      return;
    }

    const categoryList = Array.isArray(knownCategories) && knownCategories.length
      ? knownCategories.join(', ')
      : 'Beauty, Skincare, Fashion, Electronics, Kitchen, Home, Pet, Fitness, Food, Baby, Automotive, Office';

    const instruction =
      'You are a UGC (user-generated-content) ad strategist. A seller has given you a product name ' +
      'and, if available, its actual listing description scraped from an e-commerce page. ' +
      'Your job is to identify EXACTLY what this product is and does — not a generic category guess — ' +
      'and generate ad-brief material tailored to that specific product.\n\n' +
      'Product name: ' + productName + '\n' +
      'Listing description (may be empty or missing): ' + (description ? description : '(none provided)') + '\n' +
      (currentCategory ? ('Category currently selected by the user: ' + currentCategory + '\n') : '') +
      '\nRespond with STRICT JSON ONLY — no markdown fences, no preamble, no trailing text. Shape exactly:\n' +
      '{\n' +
      '  "category": one of [' + categoryList + '] that best fits, or the single word "Other" if none fit,\n' +
      '  "confidence": "high" | "medium" | "low" — your confidence that the category above is correct,\n' +
      '  "whatItActuallyIs": one short sentence stating literally what the product is/does, grounded only in the name/description given, no marketing language,\n' +
      '  "features": array of exactly 3 short phrases describing REAL, SPECIFIC features of this exact product (not generic category fluff),\n' +
      '  "painPoints": array of exactly 3 short phrases describing the real problem THIS product solves,\n' +
      '  "benefits": array of exactly 3 short phrases describing the real outcome someone gets from THIS product,\n' +
      '  "audienceHint": one short phrase describing who would actually buy this,\n' +
      '  "hookAngle": one short phrase describing the strongest attention-grabbing angle for a short-form video opener for THIS product\n' +
      '}\n\n' +
      'If the description is missing or too thin to be specific, do your best from the product name alone, ' +
      'but keep "confidence" low and keep features/painPoints/benefits plausible rather than inventing specs you cannot infer.';

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: instruction }] }],
          generationConfig: { responseMimeType: 'application/json' }
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
    const raw = parts.map((p) => p.text || '').join('\n').trim();

    let parsed;
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      res.status(502).json({ error: 'Could not parse model output as JSON', raw: raw });
      return;
    }

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unknown server error' });
  }
};
