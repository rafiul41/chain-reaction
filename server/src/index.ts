import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './room-manager';
import { registerSocketHandlers } from './socket-handlers';

const app = express();
const corsOrigin = process.env['CORS_ORIGIN'] ?? 'http://localhost:4200';

app.use(cors({ origin: corsOrigin }));
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: corsOrigin },
});

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket, roomManager);
});

const port = process.env['PORT'] ?? 3000;
httpServer.listen(port, () => {
  console.log(`Chain Reaction server listening on port ${port}`);
});
