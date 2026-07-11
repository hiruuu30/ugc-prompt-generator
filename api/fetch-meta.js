export default async function handler(req, res) {
  // Allow the frontend (your HTML file, hosted anywhere) to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter' });
  }

  // Basic validation so this can't be used as an open proxy for arbitrary schemes
  let targetUrl;
  try {
    targetUrl = new URL(url);
    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Shopee blocks plain HTML scraping almost entirely, but its web app calls its
  // own internal item API under the hood. If this is a Shopee product link, try
  // that path first. It's an unofficial endpoint — not guaranteed stable — so any
  // failure here just falls through to the generic scraper below.
  if (isShopeeHost(targetUrl.hostname)) {
    const shopeeResult = await tryShopeeApi(targetUrl);
    if (shopeeResult) {
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
      return res.status(200).json(shopeeResult);
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        // A more complete, real-browser-like header set. Some sites block
        // requests that only send a User-Agent and nothing else.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Target site returned ${response.status}` });
    }

    const html = await response.text();
    const meta = extractMeta(html, targetUrl.toString());

    // Cache for an hour at the edge so repeat lookups of the same product are instant
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(meta);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch or parse the page' });
  }
}

function isShopeeHost(hostname){
  return /(^|\.)shopee\.[a-z.]+$/i.test(hostname);
}

// Pulls {shopid, itemid} out of the two common Shopee URL shapes:
//   https://shopee.ph/product/123456789/9876543210
//   https://shopee.ph/Some-Title-i.123456789.9876543210
function extractShopeeIds(targetUrl){
  const path = targetUrl.pathname;

  let match = path.match(/\/product\/(\d+)\/(\d+)/);
  if (match) return { shopid: match[1], itemid: match[2] };

  match = path.match(/-i\.(\d+)\.(\d+)/);
  if (match) return { shopid: match[1], itemid: match[2] };

  return null;
}

async function tryShopeeApi(targetUrl){
  const ids = extractShopeeIds(targetUrl);
  if (!ids) return null;

  const apiUrl = `${targetUrl.origin}/api/v4/item/get?itemid=${ids.itemid}&shopid=${ids.shopid}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        // Shopee's API checks that requests look like they came from the item page itself
        'Referer': targetUrl.toString(),
        'X-Requested-With': 'XMLHttpRequest',
      }
    });

    if (!response.ok) return null;

    const json = await response.json();
    const item = json && json.data;
    if (!item || !item.name) return null;

    // Shopee prices are typically in units of 1/100000 of the actual currency amount.
    // Verify this against a real product before trusting it in the UI.
    const price = typeof item.price === 'number' ? item.price / 100000 : null;

    // Image hashes need a CDN prefix to become real URLs. This covers current common
    // Shopee CDN hosts, but Shopee changes these periodically — if images come back
    // null or broken, this is the first thing to re-check.
    const image = item.image ? `https://down-ph.img.susercontent.com/file/${item.image}` : null;

    return {
      title: item.name,
      description: item.description || null,
      image,
      siteName: 'Shopee',
      price,
      sourceUrl: targetUrl.toString(),
    };
  } catch (err) {
    return null;
  }
}

function extractMeta(html, pageUrl) {
  const getMetaContent = (props) => {
    for (const prop of props) {
      // Handles both attribute orders: property/content and content/property
      let match = html.match(
        new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i')
      );
      if (!match) {
        match = html.match(
          new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, 'i')
        );
      }
      if (match) return decodeEntities(match[1]);
    }
    return null;
  };

  const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);

  const title =
    getMetaContent(['og:title', 'twitter:title']) ||
    (titleTagMatch ? decodeEntities(titleTagMatch[1].trim()) : null);

  const description = getMetaContent(['og:description', 'twitter:description', 'description']);

  let image = getMetaContent(['og:image', 'twitter:image', 'twitter:image:src']);

  // Resolve relative image URLs (e.g. "/images/product.jpg") against the page's own URL
  if (image) {
    try {
      image = new URL(image, pageUrl).toString();
    } catch (e) {
      // leave as-is if it can't be resolved
    }
  }

  const siteName = getMetaContent(['og:site_name']);

  return { title, description, image, siteName, sourceUrl: pageUrl };
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}
