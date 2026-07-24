const AI_LABELS = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot', 'You.com', 'Poe', 'Phind', 'Grok', 'Meta AI'];

// Turn the captured lead source into GHL tags: always a `source:x` tag, plus
// an `ai-referral` flag when it came from an AI assistant.
function buildTags(leadSource) {
  const tags = ['website-form'];
  if (leadSource) {
    tags.push(`source:${String(leadSource).toLowerCase()}`);
    if (AI_LABELS.includes(leadSource)) tags.push('ai-referral');
  }
  return tags;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { firstName, lastName, email, phone, zipCode, message, contactPreference, leadSource, consentTransactional, consentMarketing } = req.body || {};

  if (!firstName || !email && !phone) {
    return res.status(400).json({ error: 'First name and either email or phone are required.' });
  }

  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  const tags = buildTags(leadSource);
  if (contactPreference) tags.push(`prefers-${String(contactPreference).toLowerCase()}`);
  // A2P consent: tag by what they opted into so automations can target the right audience.
  // Marketing/reactivation campaigns must ONLY go to `sms-consent-marketing` contacts.
  if (consentTransactional) tags.push('sms-consent-transactional');
  if (consentMarketing) tags.push('sms-consent-marketing');

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
        // Only send email when present + valid-looking; GHL 422s on an empty string
        // ("email must be an email"). undefined is omitted by JSON.stringify.
        email: email && email.includes('@') ? email : undefined,
        phone: phone || '',
        postalCode: zipCode || '',
        // "What needs to go" -> the GHL "What Needs to Go" custom field (contact.what_needs_to_go)
        customFields: message ? [{ id: 'xQr5AHLAFCokKlXOhyv3', field_value: message }] : [],
        tags,
        source: leadSource ? `Junk Brawlers Website (${leadSource})` : 'Junk Brawlers Website',
      }),
    });

    if (!ghlRes.ok) {
      const err = await ghlRes.text();
      console.error('GHL error:', ghlRes.status, err);
      // Only a genuine duplicate-contact block means "the lead already exists" — treat that as
      // success. Every other rejection (validation, bad field, etc.) is a REAL failure and must
      // surface to the visitor, not be silently swallowed as success (that hid two earlier bugs).
      if (/duplicat/i.test(err)) {
        return res.status(200).json({ success: true });
      }
      return res.status(502).json({ error: 'Failed to submit to CRM.' });
    }

    // Best-effort: attach "what needs to go" + contact preference as a note,
    // so Tony sees the detail on the contact. No custom field required.
    const created = await ghlRes.json().catch(() => ({}));
    const contactId = created && created.contact && created.contact.id;
    if (contactId) {
      const noteLines = [];
      if (message) noteLines.push(`What needs to go: ${message}`);
      if (contactPreference) noteLines.push(`Preferred contact: ${contactPreference}`);
      // TCPA/A2P audit trail: record exactly what was consented to, and when.
      noteLines.push(`SMS consent — transactional: ${consentTransactional ? 'YES' : 'no'}, marketing: ${consentMarketing ? 'YES' : 'no'} (captured ${new Date().toISOString()})`);
      try {
        await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({ body: noteLines.join('\n') }),
        });
      } catch (e) {
        console.error('note error:', e);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('submit error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
