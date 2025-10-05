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

      // Join a room
      socket.on("join_room", (roomId: string) => {
        socket.join(roomId);
        console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on("send_message", (msgPayload) => {
        // Broadcast to everyone in the room immediately
        console.log("new message:", msgPayload)
        io.to(msgPayload.roomId).emit("receive_message", msgPayload);
      });
      
      // If the creator makes a new room, join automatically
      socket.on("create_room", (room) => {
        socket.join(room.id); // 👈 ensure creator joins their own room
        io.emit("room_created", room);
        console.log(`📌 Creator ${socket.id} joined room ${room.id}`);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });

    global._ioServer = io;
  }

  res.status(200).end();
}
