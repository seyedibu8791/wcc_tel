const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Handle any possible TradingView format
app.use(bodyParser.text({ type: '*/*' }));
app.use(bodyParser.json({ type: '*/*', strict: false }));
app.use(bodyParser.urlencoded({ extended: true }));

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

app.post('/webhook', async (req, res) => {
  try {
    let rawBody = req.body;

    // Convert anything to readable text
    let messageText = '';

    if (typeof rawBody === 'string' && rawBody.trim() !== '') {
      messageText = rawBody;
    } else if (typeof rawBody === 'object' && Object.keys(rawBody).length > 0) {
      messageText = JSON.stringify(rawBody, null, 2);
    } else {
      messageText = '⚠️ Empty body received (TradingView sent no text)';
    }

    // Format message
    const text = `🚨 *TradingView Alert*\n\n${messageText}`;

    // Send to Telegram
    const response = await axios.post(TELEGRAM_API, {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown'
    });

    console.log('✅ Telegram sent:', response.data.result?.text || text);
    console.log('📩 Raw body received from TradingView:', rawBody);

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send('Error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook active on port ${PORT}`));
