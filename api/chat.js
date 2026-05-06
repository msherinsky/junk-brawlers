export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chatInput, sessionId, clientId } = req.body || {};

  if (!chatInput || !sessionId || !clientId) {
    return res.status(400).json({ error: 'Missing chatInput, sessionId, or clientId' });
  }

  const envKey = 'N8N_WEBHOOK_' + clientId.toUpperCase().replace(/-/g, '_');
  const N8N_WEBHOOK_URL = process.env[envKey];

  if (!N8N_WEBHOOK_URL) {
    return res.status(400).json({ error: 'Unknown client' });
  }

  try {
    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput, sessionId }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('n8n error:', upstream.status, text);
      return res.status(502).json({ error: 'Upstream error' });
    }

    const data = await upstream.json();
    return res.status(200).json({ reply: data.reply || data.output || '' });
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
