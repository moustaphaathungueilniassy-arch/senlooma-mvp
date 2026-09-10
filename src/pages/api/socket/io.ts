import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function ioHandler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    const path = '/api/socket/io';
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
    });
    
    io.on('connection', (socket) => {
      // Rejoindre la room de la conversation
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId);
      });
      
      socket.on('disconnect', () => {
        // Handle disconnect if needed
      });
    });
    
    res.socket.server.io = io;
  }
  res.end();
}
