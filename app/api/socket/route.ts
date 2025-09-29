import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/src/types/next"; // we'll create this type
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export const config = {
  api: { bodyParser: false }, 
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("🔌 Starting Socket.IO server...");

    const io = new SocketIOServer(res.socket.server as unknown as HTTPServer, {
      path: "/api/socket", // must match client path
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}
