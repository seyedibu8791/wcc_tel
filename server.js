const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json({ limit: '1mb' })); // increase payload size just in case

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// Utility to safely parse float
const safeFloat = (val, fallback = "N/A") => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

app.post('/webhook', async (req, res) => {
  try {
    // Grab the alert text safely
    const alertText = req.body.message || req.body.text || JSON.stringify(req.body);

    // Default values
    let action = "UNKNOWN";
    let symbol = "UNKNOWN";
    let entryPrice = "N/A";
    let tradeSize = "N/A";
    let leverage = "Isolated 10X"; // default
    let stopLossPercent = "N/A";
    let stopLossPrice = "N/A";

    // Extract order info: order sell @ 24.798 filled on UNIUSDT
    const orderRegex = /order\s+(buy|sell|exit_long|exit_short)\s*@\s*([\d.]+)\s*filled on\s*([A-Z0-9]+)/i;
    const orderMatch = alertText.match(orderRegex);
    if (orderMatch) {
      const rawAction = orderMatch[1].toUpperCase();
      if (rawAction === "BUY" || rawAction === "SELL") action = rawAction;
      else if (rawAction === "EXIT_LONG") action = "EXIT_LONG";
      else if (rawAction === "EXIT_SHORT") action = "EXIT_SHORT";

      entryPrice = safeFloat(orderMatch[2]);
      symbol = orderMatch[3].toUpperCase();
    }

    // Extract trade size: Percent 2
    const tradeSizeRegex = /(Percent|Amount)\s+([\d.]+)/i;
    const tradeSizeMatch = alertText.match(tradeSizeRegex);
    if (tradeSizeMatch) {
      tradeSize = `${tradeSizeMatch[1]} ${tradeSizeMatch[2]}`;
    }

    // Extract leverage: Isolated 10X
    const leverageRegex = /(Isolated|Cross)\s+(\d+)X/i;
    const leverageMatch = alertText.match(leverageRegex);
    if (leverageMatch) {
      leverage = `${leverageMatch[1]} ${leverageMatch[2]}X`;
    }

    // Extract stop loss: 0.5%
    const slRegex = /stop\s*loss[:\s]+([\d.]+)/i;
    const slMatch = alertText.match(slRegex);
    if (slMatch) {
      stopLossPercent = safeFloat(slMatch[1]) + "%";
      stopLossPrice = entryPrice !== "N/A" ? (entryPrice * (1 - slMatch[1]/100)).toFixed(4) : "N/A";
    }

    // Build Telegram message
    const telegramMessage = `
🚨 TradingView Alert

Action: ${action}
Symbol: ${symbol}
Entry Price: ${entryPrice}
Trade Size: ${tradeSize}
Leverage: ${leverage}
Stop Loss Price: ${stopLossPrice} (${stopLossPercent})
`.trim();

    // Send to Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: telegramMessage,
      parse_mode: 'Markdown',
    });

    console.log('✅ Alert sent:', telegramMessage);
    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error.message, error.response?.data || '', req.body);
    res.status(500).send('Error forwarding alert');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
