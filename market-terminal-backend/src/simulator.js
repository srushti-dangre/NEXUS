const { currentPrices, priceHistory } = require('./marketData');

function runSimulation(type, symbol, io) {
  console.log(`🎮 Running simulation: ${type} on ${symbol}`);

  if (type === 'FLASH_CRASH') {
    flashCrash(symbol, io);
  } else if (type === 'SUDDEN_PUMP') {
    suddenPump(symbol, io);
  } else if (type === 'VOLATILITY_SPIKE') {
    volatilitySpike(symbol, io);
  }
}

function flashCrash(symbol, io) {
  const originalPrice = currentPrices[symbol];
  let step = 0;
  const crashSteps = 8;

  const interval = setInterval(() => {
    step++;
    const crashFactor = 1 - (0.03 * step); // drop 3% per step
    currentPrices[symbol] = originalPrice * crashFactor;

    io.emit('simulationEvent', {
      type: 'FLASH_CRASH',
      symbol,
      step,
      price: parseFloat(currentPrices[symbol].toFixed(2)),
      message: `⚠ FLASH CRASH: ${symbol} dropping rapidly`,
    });

    if (step >= crashSteps) {
      clearInterval(interval);
      // Recover after 5 seconds
      setTimeout(() => {
        currentPrices[symbol] = originalPrice;
      }, 5000);
    }
  }, 500);
}

function suddenPump(symbol, io) {
  const originalPrice = currentPrices[symbol];
  let step = 0;
  const pumpSteps = 6;

  const interval = setInterval(() => {
    step++;
    currentPrices[symbol] = originalPrice * (1 + 0.04 * step); // pump 4% per step

    io.emit('simulationEvent', {
      type: 'SUDDEN_PUMP',
      symbol,
      step,
      price: parseFloat(currentPrices[symbol].toFixed(2)),
      message: `🚀 PUMP: ${symbol} surging rapidly`,
    });

    if (step >= pumpSteps) {
      clearInterval(interval);
      setTimeout(() => {
        currentPrices[symbol] = originalPrice * 1.1; // settle 10% higher
      }, 5000);
    }
  }, 500);
}

function volatilitySpike(symbol, io) {
  let step = 0;
  const spikeSteps = 12;
  const basePrice = currentPrices[symbol];

  const interval = setInterval(() => {
    step++;
    const swing = basePrice * 0.02 * (Math.random() > 0.5 ? 1 : -1);
    currentPrices[symbol] = basePrice + swing * step * 0.3;

    io.emit('simulationEvent', {
      type: 'VOLATILITY_SPIKE',
      symbol,
      step,
      price: parseFloat(currentPrices[symbol].toFixed(2)),
      message: `⚡ VOLATILITY: ${symbol} erratic movement`,
    });

    if (step >= spikeSteps) clearInterval(interval);
  }, 400);
}

module.exports = { runSimulation };