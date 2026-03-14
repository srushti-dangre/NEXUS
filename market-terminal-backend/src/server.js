const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { startMarketDataStream } = require('./marketData');
const { runSimulation } = require('./simulator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://*.vercel.app'],
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ status: 'Market Terminal Backend Running', timestamp: new Date() });
});

// REST: get available symbols
app.get('/api/symbols', (req, res) => {
  res.json({
    symbols: ['BTC', 'ETH', 'AAPL', 'NIFTY', 'GOOGL', 'TSLA'],
  });
});

// REST: trigger a simulation event
app.post('/api/simulate', (req, res) => {
  const { type, symbol } = req.body;
  runSimulation(type, symbol, io);
  res.json({ success: true, message: `Simulation '${type}' triggered for ${symbol}` });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`\n🚀 Market Terminal Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 REST API at http://localhost:${PORT}\n`);

  // Start streaming market data to all connected clients
  startMarketDataStream(io);
});