// server.js — bulletproof version for TradingView alerts
const express = require('express');
const axios = require('axios');
const app = express();

// Capture both raw text and JSON
app.use(express.text({ type: '*/*', limit: '1mb' }));

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

app.post('/webhook', async (req, res) => {
  try {
    let body = req.body;

    // Sometimes TradingView sends escaped JSON or nested strings
    if (typeof body === 'string') {
      // Try to parse if it looks like JSON
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed === 'object') {
          body = JSON.stringify(parsed, null, 2);
        }
      } catch {
        // not JSON, leave as plain string
      }
    } else if (typeof body === 'object') {
      body = JSON.stringify(body, null, 2);
    }

    const text = `🚨 TradingView Alert\n\n${body || '⚠️ Empty body received'}`;

    // Send to Telegram (plain text, no parse_mode)
    await axios.post(TELEGRAM_API, {
      chat_id: CHAT_ID,
      text
    });

    console.log('✅ Sent to Telegram:', text);
    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Error sending Telegram message:', err.message);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook listening on port ${PORT}`));
