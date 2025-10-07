const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = '8214186320:AAGpMuO7aMRjuozhMYHa3rxW9vW7NtG7g5w';
const CHAT_ID = '-1003103152784';

// Utility function to calculate Stop Loss price
function calculateStopLossPrice(entryPrice, action, slPercent) {
  if (!entryPrice || !slPercent) return "N/A";
  const sl = parseFloat(slPercent);
  const price = parseFloat(entryPrice);
  if (action === "BUY") {
    return (price * (1 - sl / 100)).toFixed(4);
  } else if (action === "SELL") {
    return (price * (1 + sl / 100)).toFixed(4);
  } else {
    return "N/A";
  }
}

app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    // Check if required fields exist
    const action = data.action || "UNKNOWN";
    const symbol = data.symbol || "UNKNOWN";
    const entryPrice = data.entry_price || "N/A";
    const tradeSize = data.trade_size || "N/A";
    const leverage = data.leverage || "UNKNOWN";
    const slPercent = data.stop_loss_pct || "N/A";

    const stopLossPrice = calculateStopLossPrice(entryPrice, action, slPercent);

    // Construct Telegram message
    const message = `
🚨 TradingView Alert

Action: ${action}
Symbol: ${symbol}
Entry Price: ${entryPrice}
Trade Size: ${tradeSize}
Leverage: ${leverage}
Stop Loss Price: ${stopLossPrice} (${slPercent}%)
`;

    // Send to Telegram
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });

    console.log("✅ Alert sent:", message);
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
