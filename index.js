const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const RAYNET_API_KEY = 'Basic aW5mb0B0YWxlbnRwcm9kdWN0aW9zLmN6OmNybS00MmJkZDczYTM3ODc0ODFmYmRkNzNhMzc4N2E4MWZhNA==';
const RAYNET_INSTANCE = 'dvk';
const RAYNET_BASE_URL = 'https://app.raynet.cz/api/v2';

const axiosRaynet = axios.create({
  baseURL: RAYNET_BASE_URL,
  headers: {
    'Authorization': RAYNET_API_KEY,
    'X-Instance-Name': RAYNET_INSTANCE,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

app.post('/api/client-history', async (req, res) => {
  const clientName = req.body.clientName;
  if (!clientName) {
    return res.status(400).json({ error: 'Chybí jméno klienta.' });
  }

  try {
    // 1. Najdi klienta podle jména
    const companyResp = await axiosRaynet.get(`/company?name[LIKE]=${encodeURIComponent(clientName)}`);
    const companies = companyResp.data.data;

    if (!companies || companies.length === 0) {
      return res.status(404).json({ error: `Klient '${clientName}' nebyl nalezen.` });
    }

    const companyId = companies[0].id;

    // 2. Získání historie aktivit
    const activityResp = await axiosRaynet.get(`/activity?company=${companyId}`);
    const activities = activityResp.data.data;

    if (!activities || activities.length === 0) {
      return res.json({
        history: [],
        message: 'Klient nemá žádnou evidovanou aktivitu.'
      });
    }

    // 3. Zestručni a vrať historii
    const history = activities.slice(0, 5).map(a => ({
      date: a.date,
      type: a.activityType?.name || 'Aktivita',
      summary: a.subject || '(bez předmětu)',
      waitingForClient: a.direction === 'OUT' // jen ukázkově
    }));

    res.json({
      clientId: companyId,
      history
    });

  } catch (err) {
    console.error("CHYBA:", err.response?.data || err.message);
    res.status(500).json({
      error: true,
      detail: err.response?.data || err.message
    });
  }
});

// Default fallback
app.all("/*", (req, res) => {
  res.status(404).json({ error: "Neznámá cesta" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy běží na portu ${PORT}`);
});
