const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// ----------------------------
// Webhook endpoint
// ----------------------------
app.post('/webhook', async (req, res) => {
  try {
    // TradingView sends JSON as "text" string
    const tvText = req.body.text || req.body.alert_text || req.body.message;

    if (!tvText) {
      console.warn('No alert text found in request');
      return res.status(400).send('No alert text found');
    }

    // Parse the JSON string from TradingView alertcondition()
    let alertData;
    try {
      alertData = JSON.parse(tvText);
    } catch (err) {
      console.warn('Failed to parse alert JSON, sending raw text');
      alertData = { raw: tvText }; // fallback to raw text
    }

    // Format message for Telegram
    let telegramMessage = '🚨 TradingView Alert\n\n';
    for (const key in alertData) {
      telegramMessage += `*${key}*: ${alertData[key]}\n`;
    }

    // Send message to Telegram
    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown',
      }
    );

    console.log('✅ Alert sent:', telegramResponse.data);
    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error.response?.data || error.message);
    res.status(500).send('Error forwarding alert');
  }
});

// ----------------------------
// Start server
// ----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
