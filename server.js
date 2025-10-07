const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

app.post('/webhook', async (req, res) => {
  try {
    const alertDataRaw = req.body;

    // If the incoming data is a string, parse it as JSON
    let alertData;
    if (typeof alertDataRaw === 'string') {
      alertData = JSON.parse(alertDataRaw);
    } else {
      alertData = alertDataRaw;
    }

    // Format the message for Telegram
    const formattedMessage = Object.entries(alertData)
      .map(([key, value]) => `*${key}*: ${value}`)
      .join('\n');

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🚨 TradingView Alert\n\n${formattedMessage}`,
      parse_mode: 'Markdown',
    });

    console.log("✅ Alert sent:", formattedMessage);
    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error.response ? error.response.data : error);
    res.status(500).send('Error forwarding alert');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
