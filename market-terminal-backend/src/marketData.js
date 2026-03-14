const { detectAnomalies } = require('./anomalyDetector');

// Starting prices for each symbol
const BASE_PRICES = {
  BTC:   65000,
  ETH:   3200,
  AAPL:  189,
  NIFTY: 22500,
  GOOGL: 175,
  TSLA:  245,
};

// Store recent price history for anomaly detection
const priceHistory = {};
const volumeHistory = {};

// Initialize history arrays
Object.keys(BASE_PRICES).forEach((symbol) => {
  priceHistory[symbol] = [BASE_PRICES[symbol]];
  volumeHistory[symbol] = [1000000];
});

// Current prices (will drift over time)
const currentPrices = { ...BASE_PRICES };

// Generate a realistic random price movement
function getNextPrice(symbol) {
  const price = currentPrices[symbol];
  const volatility = 0.002; // 0.2% max move per tick
  const change = price * volatility * (Math.random() * 2 - 1);
  const newPrice = Math.max(price + change, price * 0.5);
  currentPrices[symbol] = newPrice;
  return parseFloat(newPrice.toFixed(2));
}

// Generate realistic volume
function getNextVolume(symbol) {
  const baseVolume = 1000000;
  const volume = baseVolume * (0.5 + Math.random() * 1.5);
  return Math.floor(volume);
}

// Main streaming function — fires every 1 second
function startMarketDataStream(io) {
  console.log('📊 Market data stream started');

  setInterval(() => {
    const ticks = [];

    Object.keys(BASE_PRICES).forEach((symbol) => {
      const price = getNextPrice(symbol);
      const volume = getNextVolume(symbol);
      const prevPrice = priceHistory[symbol][priceHistory[symbol].length - 1];
      const change = price - prevPrice;
      const changePct = ((change / prevPrice) * 100).toFixed(3);

      // Keep rolling history (last 50 ticks)
      priceHistory[symbol].push(price);
      volumeHistory[symbol].push(volume);
      if (priceHistory[symbol].length > 50) priceHistory[symbol].shift();
      if (volumeHistory[symbol].length > 50) volumeHistory[symbol].shift();

      // Run anomaly detection
      const anomaly = detectAnomalies(symbol, price, volume, priceHistory[symbol], volumeHistory[symbol]);

      const tick = {
        symbol,
        price,
        volume,
        change: parseFloat(change.toFixed(2)),
        changePct: parseFloat(changePct),
        timestamp: new Date().toISOString(),
        anomaly: anomaly || null,
      };

      ticks.push(tick);
    });

    // Emit all ticks at once to every connected client
    io.emit('marketData', ticks);

  }, 1000); // every 1 second
}

module.exports = { startMarketDataStream, currentPrices, priceHistory, volumeHistory };