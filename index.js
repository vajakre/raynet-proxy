const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const RAYNET_API_KEY = 'Basic aW5mb0B0YWxlbnRwcm9kdWN0aW9zLmN6OmNybS00MmJkZDczYTM3ODc0ODFmYmRkNzNhMzc4N2E4MWZhNA==';

app.post('/api/client-history', async (req, res) => {
  const { clientName } = req.body;

  if (!clientName) {
    return res.status(400).json({ error: 'Chybí jméno klienta' });
  }

  try {
    const response = await axios.get(`https://app.raynet.cz/api/v2/company?name=${encodeURIComponent(clientName)}`, {
      headers: {
        'Authorization': RAYNET_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: 'Klient nebyl nalezen' });
    }

    const history = response.data.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone
    }));

    res.json({ history });

  } catch (error) {
    console.error('❌ Chyba při volání Raynet API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Chyba při volání Raynet API', details: error.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Proxy server běží na portu 3000');
});
