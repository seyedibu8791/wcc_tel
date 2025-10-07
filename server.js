app.post('/webhook', async (req, res) => {
  try {
    const alertMsg = req.body.message || req.body.text || ""; // capture message
    const regex = /Action=(.+?), Symbol=(.+?), Price=(.+?), Size=(.+)/;
    const match = alertMsg.match(regex);

    let action = match?.[1] || "UNKNOWN";
    let symbol = match?.[2] || "UNKNOWN";
    let entryPrice = match?.[3] || "UNKNOWN";
    let size = match?.[4] || "UNKNOWN";

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
