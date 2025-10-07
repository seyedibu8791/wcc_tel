const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// Pine Script inputs
const BINANCE_MARGIN = 'Isolated';
const BINANCE_LEVERAGE = 10;
const STOP_LOSS_PERCENT = 0.5; // 0.5% stop loss

app.post('/webhook', async (req, res) => {
  try {
    const alertText = req.body.message || req.body;
    console.log('Received alert:', alertText);

    const parsed = parseTVMessage(alertText);

    // Calculate Stop Loss price for entry signals
    let stopLossPrice = 'N/A';
    if (parsed.action === 'BUY' && parsed.price !== 'UNKNOWN') {
      stopLossPrice = (parseFloat(parsed.price) * (1 - STOP_LOSS_PERCENT / 100)).toFixed(6);
    } else if (parsed.action === 'SELL' && parsed.price !== 'UNKNOWN') {
      stopLossPrice = (parseFloat(parsed.price) * (1 + STOP_LOSS_PERCENT / 100)).toFixed(6);
    }

    // Build Telegram message dynamically
    const telegramMessage = {
      chat_id: CHAT_ID,
      text: `🚨 *TradingView Alert*\n\n` +
            `*Action*: ${parsed.action}\n` +
            `*Symbol*: ${parsed.symbol}\n` +
            `*Entry Price*: ${parsed.price}\n` +
            `*Trade Size*: ${parsed.tradeSize || 'N/A'}\n` +
            `*Leverage*: ${BINANCE_MARGIN} ${BINANCE_LEVERAGE}X\n` +
            `*Stop Loss Price*: ${stopLossPrice} (${STOP_LOSS_PERCENT}%)`,
      parse_mode: 'Markdown'
    };

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, telegramMessage);

    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error.response?.data || error);
    res.status(500).send('Error forwarding alert');
  }
});

// Enhanced parser for TradingView default messages
function parseTVMessage(message) {
  let action = 'UNKNOWN';
  let symbol = 'UNKNOWN';
  let price = 'UNKNOWN';
  let tradeSize = 'UNKNOWN';

  try {
    // Detect action
    if (/order buy/i.test(message)) action = 'BUY';
    else if (/order sell/i.test(message)) action = 'SELL';
    else if (/exit_long/i.test(message)) action = 'EXIT_LONG';
    else if (/exit_short/i.test(message)) action = 'EXIT_SHORT';

    // Detect symbol
    const symbolMatch = message.match(/on\s([A-Z]+[A-Z0-9]*)/i);
    if (symbolMatch) symbol = symbolMatch[1];

    // Detect price
    const priceMatch = message.match(/@\s*([\d.]+)/);
    if (priceMatch) price = priceMatch[1];

    // Detect trade size (if mentioned as "filled" or in brackets)
    const sizeMatch = message.match(/position is\s(-?[\d.]+)/i);
    if (sizeMatch) tradeSize = sizeMatch[1];
  } catch (err) {
    console.error('Parsing error:', err);
  }

  return { action, symbol, price, tradeSize };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
