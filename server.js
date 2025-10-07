const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID = 'YOUR_CHAT_ID';

app.post('/webhook', async (req, res) => {
  try {
    const alertData = req.body;
    const formattedMessage = Object.entries(alertData)
      .map(([key, value]) => `*${key}*: ${value}`)
      .join('\n');

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: `🚨 *TradingView Alert*\n\n${formattedMessage}`,
      parse_mode: 'Markdown',
    });

    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error);
    res.status(500).send('Error forwarding alert');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
