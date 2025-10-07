app.post('/webhook', async (req, res) => {
  try {
    const alertMsg = req.body.message || req.body.text || ""; // capture message
    const regex = /Action=(.+?), Symbol=(.+?), Price=(.+?), Size=(.+)/;
    const match = alertMsg.match(regex);

    let action = match?.[1] || "UNKNOWN";
    let symbol = match?.[2] || "UNKNOWN";
    let entryPrice = match?.[3] || "UNKNOWN";
    let size = match?.[4] || "UNKNOWN";const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// Utility to safely parse float
const safeFloat = (val, fallback = "N/A") => {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

app.post('/webhook', async (req, res) => {
  try {
    const alertText = req.body.message || req.body.text || "";

    // Default values
    let action = "UNKNOWN";
    let symbol = "UNKNOWN";
    let entryPrice = "N/A";
    let tradeSize = "N/A";
    let leverage = "Isolated 10X"; // default
    let stopLossPercent = "N/A";
    let stopLossPrice = "N/A";

    // Regex to extract order info
    // Example: order sell @ 24.798 filled on UNIUSDT
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

    // Regex to extract trade size (from your PineScript inputs, if present in alert)
    // Example: Percent 2
    const tradeSizeRegex = /(Percent|Amount)\s+([\d.]+)/i;
    const tradeSizeMatch = alertText.match(tradeSizeRegex);
    if (tradeSizeMatch) {
      tradeSize = `${tradeSizeMatch[1]} ${tradeSizeMatch[2]}`;
    }

    // Regex to extract leverage
    const leverageRegex = /(Isolated|Cross)\s+(\d+)X/i;
    const leverageMatch = alertText.match(leverageRegex);
    if (leverageMatch) {
      leverage = `${leverageMatch[1]} ${leverageMatch[2]}X`;
    }

    // Regex to extract stop loss percentage
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
    console.error('Error forwarding alert:', error.message, error.response?.data || '');
    res.status(500).send('Error forwarding alert');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


    // Pine inputs (hardcoded here or fetch from config)
    const leverage = "Isolated 10X";
    const slPercent = 0.5; // 0.5% SL
    const stopLossPrice = entryPrice !== "UNKNOWN" ? (parseFloat(entryPrice) * (action.includes("BUY") ? (1 - slPercent / 100) : (1 + slPercent / 100))).toFixed(4) : "N/A";

    const telegramMsg = `🚨 TradingView Alert\n\nAction: ${action}\nSymbol: ${symbol}\nEntry Price: ${entryPrice}\nTrade Size: ${size}\nLeverage: ${leverage}\nStop Loss Price: ${stopLossPrice} (${slPercent}%)`;

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: telegramMsg,
      parse_mode: 'Markdown',
    });

    res.status(200).send('Alert forwarded to Telegram');
  } catch (error) {
    console.error('Error forwarding alert:', error);
    res.status(500).send('Error forwarding alert');
  }
});
