import type { NextApiRequest, NextApiResponse } from "next/types";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { Socket } from "net";

export const config = {
  api: { bodyParser: false },
};

declare global {
  var _ioServer: SocketIOServer | undefined;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const server = (res.socket as Socket & { server?: HTTPServer }).server;

  if (!server) {
    console.error("No HTTP server found on res.socket!");
    return res.status(500).end();
  }

  if (!global._ioServer) {
    console.log("🔌 Starting Socket.IO server...");

    const io = new SocketIOServer(server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("ping", (msg) => {
        console.log("📨 Ping received:", msg);
        socket.emit("pong", `Pong: ${msg}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });

    global._ioServer = io;
  }

  res.status(200).end();
}
