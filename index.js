const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const RAYNET_API_KEY = 'Basic aW5mb0B0YWxlbnRwcm9kdWN0aW9zLmN6OmNybS00MmJkZDczYTM3ODc0ODFmYmRkNzNhMzc4N2E4MWZhNA==';
const RAYNET_INSTANCE = 'dvk';

app.post('/api/client-history', async (req, res) => {
  const { clientName } = req.body;

  try {
    const clientSearch = await axios.get(
      `https://${RAYNET_INSTANCE}.raynet.cz/api/v2/company/`,
      {
        params: { name: clientName },
        headers: {
          'X-Instance-Name': RAYNET_INSTANCE,
          'Authorization': RAYNET_API_KEY
        }
      }
    );

    const clientId = clientSearch.data.data[0]?.id;
    if (!clientId) return res.status(404).json({ error: 'Klient nenalezen' });

    const activities = await axios.get(
      `https://${RAYNET_INSTANCE}.raynet.cz/api/v2/company/${clientId}/history`,
      {
        params: { limit: 5 },
        headers: {
          'X-Instance-Name': RAYNET_INSTANCE,
          'Authorization': RAYNET_API_KEY
        }
      }
    );

    const history = activities.data.data.map(a => ({
      date: a.createdAt.split('T')[0],
      type: a.activityType?.label || 'Jiná aktivita',
      summary: a.subject,
      waitingForClient: a.direction === 'OUTGOING'
    }));

    res.json({ history });

  } catch (err) {
  console.error('CHYBA:', err.response?.data || err.message);
  res.status(500).json({ 
    error: 'Chyba při načítání dat z Raynetu.',
    details: err.response?.data || err.message 
  });
}
} catch (err) {
  console.error('CHYBA:', err.response?.data || err.message);
  res.status(500).json({ 
    error: 'Chyba při načítání dat z Raynetu.',
    details: err.response?.data || err.message 
  });
}

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy běží na portu ${PORT}`));
