const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Escape function for MarkdownV2
function escapeMarkdownV2(text) {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

app.post('/webhook', async (req, res) => {
    try {
        const alertData = req.body;

        // Format the alert message and escape special characters
        const formattedMessage = Object.entries(alertData)
            .map(([key, value]) => `*${escapeMarkdownV2(key)}*: ${escapeMarkdownV2(value)}`)
            .join('\n');

        const message = `🚨 *TradingView Alert*\n\n${formattedMessage}`;

        // Send to Telegram
        const response = await axios.post(TELEGRAM_API, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'MarkdownV2'
        });

        console.log('✅ Alert sent:', response.data);
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
