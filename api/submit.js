export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, email, phone, zipCode, message } = req.body || {};

  if (!firstName || !email && !phone) {
    return res.status(400).json({ error: 'First name and either email or phone are required.' });
  }

  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  try {
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        firstName,
        lastName: lastName || '',
        email: email || '',
        phone: phone || '',
        postalCode: zipCode || '',
        customFields: message ? [{ key: 'message', field_value: message }] : [],
        tags: ['website-form'],
        source: 'Junk Brawlers Website',
      }),
    });

    if (!ghlRes.ok) {
      const err = await ghlRes.text();
      console.error('GHL error:', ghlRes.status, err);
      // 400/422 typically means duplicate contact — treat as success so the user gets confirmation
      if (ghlRes.status === 400 || ghlRes.status === 422) {
        return res.status(200).json({ success: true });
      }
      return res.status(502).json({ error: 'Failed to submit to CRM.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('submit error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
