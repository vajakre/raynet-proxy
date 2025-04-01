const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const RAYNET_API_KEY = 'Basic aW5mb0B0YWxlbnRwcm9kdWN0aW9zLmN6OmNybS00MmJkZDczYTM3ODc0ODFmYmRkNzNhMzc4N2E4MWZhNA==';
const RAYNET_BASE_URL = 'https://dvk.raynet.cz/api/v2/';

app.all("/*", async (req, res) => {
  const path = req.path;
  const method = req.method.toLowerCase();
  const fullUrl = `${RAYNET_BASE_URL}${path.replace(/^\/+/, '')}`;

  try {
    const response = await axios({
      url: fullUrl,
      method: method,
      headers: {
        'Authorization': RAYNET_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: req.body
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    console.error("Chyba při volání Raynet API:", err.message);

    if (err.response) {
      const contentType = err.response.headers['content-type'] || '';
      const isJson = contentType.includes('application/json');
      const fallbackData = isJson ? err.response.data : { error: 'Neplatná odpověď z Raynetu', detail: err.response.data };

      res.status(err.response.status).json({
        error: true,
        status: err.response.status,
        data: fallbackData,
      });
    } else {
      res.status(500).json({
        error: true,
        message: "Chyba serveru nebo nedostupné API",
        detail: err.message,
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy běží na portu ${PORT}`);
});
