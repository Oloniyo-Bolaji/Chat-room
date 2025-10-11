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

      socket.on("join_room", (data) => {
        const { roomId, userName, silent } = data;
        socket.join(roomId);

        // Only emit system message if NOT silent
        if (!silent && userName) {
          socket.to(roomId).emit("user_joined", {
            roomId: roomId,
            senderId: "system",
            text: `${userName} joined the room`,
            timestamp: new Date().toISOString(),
            sender: {
              id: "system",
              name: "system",
              email: "",
              image: "",
              username: "system",
            },
          });
          console.log(`📢 ${userName} joined room ${roomId}`);
        } else {
          console.log(`🔇 Silent rejoin to room ${roomId}`);
        }
      });

      socket.on("user_typing", (data) => {
        const { user, roomId, typing } = data;
        console.log(`${user} is ${typing ? "typing..." : "stopped typing"}`);

        // Broadcast to other users in the same room
        socket.to(roomId).emit("user_typing", {
          user: user,
          roomId: roomId,
          typing: typing,
        });
      });
      
      socket.on("send_message", (msgPayload) => {
        console.log("💬 New message in room:", msgPayload.roomId);

        // 1. Emit for message display in current chat
        socket.to(msgPayload.roomId).emit("receive_message", msgPayload);

        // 2. Emit for unread counts and last message updates
        socket.to(msgPayload.roomId).emit("new_message", msgPayload);
      });

      // If the creator makes a new room, join automatically
      socket.on("create_room", (room) => {
        socket.join(room.id);
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
