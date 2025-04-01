const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const RAYNET_API_KEY = 'Basic aW5mb0B0YWxlbnRwcm9kdWN0aW9zLmN6OmNybS00MmJkZDczYTM3ODc0ODFmYmRkNzNhMzc4N2E4MWZhNA==';
const RAYNET_BASE_URL = 'https://app.raynet.cz/api/v2';

app.post('/api/client-history', async (req, res) => {
  const { clientName } = req.body;

  if (!clientName) {
    return res.status(400).json({ error: 'Missing clientName in request.' });
  }

    try {
    // 1. Vyhledání klienta podle názvu
    const searchResponse = await axios.get(`${RAYNET_BASE_URL}/company`, {
      headers: {
        Authorization: RAYNET_API_KEY,
        'Content-Type': 'application/json'
      },
      params: {
        name: clientName
      }
    });

    const companies = searchResponse.data.data;

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: 'Klient nenalezen v Raynetu.' });
    }

    const client = companies[0]; // první shoda

    // Zatím vrátíme jen základní informace o klientovi
    res.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone
      },
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          type: 'Záznam z CRM',
          summary: 'Zatím pouze test – žádná reálná historie.',
          waitingForClient: true
        }
      ]
    });

  } catch (error) {
    console.error('❌ CHYBA V PROXY:', error.message);
    if (error.response) {
      console.error('📄 Raynet odpověď:', JSON.stringify(error.response.data));
    }
    res.status(500).json({
      error: 'Chyba při volání Raynet API',
      details: error.response?.data || error.message
    });
  }


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server běží na portu ${PORT}`);
});
