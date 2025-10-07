const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// ======= TELEGRAM SETTINGS =======
const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// ======= WEBHOOK =======
app.post('/webhook', async (req, res) => {
  try {
    const alertData = req.body;

    // Check if alertData is stringified JSON and parse
    let alertJSON = {};
    if (typeof alertData === 'string') {
      alertJSON = JSON.parse(alertData);
    } else {
      alertJSON = alertData;
    }

    // Construct Telegram message
    let telegramMessage = `🚨 TradingView Alert\n\n`;
    for (const key in alertJSON) {
      telegramMessage += `*${key}*: ${alertJSON[key]}\n`;
    }

    // Send message to Telegram
    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: telegramMessage,
      parse_mode: 'Markdown',
    });

    console.log("✅ Alert sent:", response.data);
    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('❌ Error forwarding alert:', error.response ? error.response.data : error.message);
    res.status(500).send('Error forwarding alert');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
