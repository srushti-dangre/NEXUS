// Z-score based anomaly detection
function calculateZScore(value, history) {
  if (history.length < 5) return 0;
  const mean = history.reduce((a, b) => a + b, 0) / history.length;
  const variance = history.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / history.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return Math.abs((value - mean) / stdDev);
}

function detectAnomalies(symbol, price, volume, priceHistory, volumeHistory) {
  const priceZScore  = calculateZScore(price,  priceHistory);
  const volumeZScore = calculateZScore(volume, volumeHistory);

  // Price spike: Z-score > 2.5
  if (priceZScore > 2.5) {
    return {
      type: 'PRICE_SPIKE',
      message: `${symbol} unusual price movement detected`,
      severity: priceZScore > 3.5 ? 'HIGH' : 'MEDIUM',
      zScore: parseFloat(priceZScore.toFixed(2)),
    };
  }

  // Volume spike: Z-score > 2.5
  if (volumeZScore > 2.5) {
    return {
      type: 'VOLUME_SPIKE',
      message: `${symbol} unusual volume spike detected`,
      severity: volumeZScore > 3.5 ? 'HIGH' : 'MEDIUM',
      zScore: parseFloat(volumeZScore.toFixed(2)),
    };
  }

  // Volatility burst: rapid price change > 1%
  if (priceHistory.length >= 3) {
    const recent = priceHistory.slice(-3);
    const maxMove = Math.max(...recent) - Math.min(...recent);
    const pctMove = (maxMove / recent[0]) * 100;
    if (pctMove > 1) {
      return {
        type: 'VOLATILITY_BURST',
        message: `${symbol} volatility increasing`,
        severity: 'MEDIUM',
        zScore: parseFloat(priceZScore.toFixed(2)),
      };
    }
  }

  return null;
}

module.exports = { detectAnomalies, calculateZScore };