import express, { Request, Response, Application } from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/handler.js';

const app: Application = express();
const httpServer: HttpServer = createServer(app);

const FRONTEND_URL: string =
  process.env.FRONTEND_URL ?? 'http://localhost:3000';

const cors_middleware = cors({
  origin: FRONTEND_URL,
  credentials: true,
});
app.use(cors_middleware);

const io: SocketIOServer = new SocketIOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketHandlers(io);

app.use(express.json());
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const PORT: number = Number(process.env.PORT) || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io ready for connections');
});
