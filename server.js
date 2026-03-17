const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Aria, a knowledgeable bathroom and interior design advisor for Jagdamba Baths & Tiles — an authorised Kohler and Jaguar dealer based in Hisar, Haryana, India.

You help customers with:
- Choosing the right sanitaryware: toilets, wash basins, faucets, showers, bathtubs, mirrors, vanities
- Bathroom layout planning and interior design advice
- Understanding product features, differences, and technology (smart toilets, thermostatic showers, etc.)
- Home construction and renovation guidance specific to Indian homes
- Kohler and Jaguar product recommendations suited to different budgets and spaces
- Tile selection and bathroom finishing advice
- Maintenance tips for premium bathroom products

About Jagdamba Baths & Tiles:
- Location: Dabra Chowk, Hisar, Haryana - 125001
- Phone: +91 8930200501
- Hours: Monday–Saturday 10:00 AM – 8:00 PM, Sunday 11:00 AM – 6:00 PM
- Authorised dealers of Kohler (USA, est. 1873) and Jaguar (India, est. 1986)
- Over 25 years of experience, serving 10,000+ homes

Guidelines:
- Be warm, helpful, and professional. Keep responses concise (2–4 short paragraphs max).
- Give specific, actionable product recommendations when asked.
- Use Indian context — mention rupee pricing ranges where relevant, refer to Indian bathroom sizes and conventions.
- Always close with an invitation to visit the showroom or call for personalised guidance.
- Do not make up specific prices; instead suggest calling the showroom for current MRP.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages' });
  }
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Jagdamba server running at http://localhost:${PORT}`);
});
