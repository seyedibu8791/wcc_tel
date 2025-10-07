const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// Utility to format alert JSON into Telegram-friendly Markdown
function formatAlertMessage(alertData) {
  let message = '🚨 *TradingView Alert*\n\n';
  try {
    const data = typeof alertData === 'string' ? JSON.parse(alertData) : alertData;
    for (const [key, value] of Object.entries(data)) {
      message += `*${key}*: ${value}\n`;
    }
  } catch (err) {
    // If parsing fails, just send the raw message
    message += alertData;
  }
  return message;
}

app.post('/webhook', async (req, res) => {
  try {
    const alertData = req.body;
    const formattedMessage = formatAlertMessage(alertData);

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: formattedMessage,
        parse_mode: 'Markdown',
      }
    );

    console.log('✅ Alert sent:', telegramResponse.data);
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
