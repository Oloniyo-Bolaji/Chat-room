// components/SocketTest.tsx
"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

const SocketTest = () => {
  useEffect(() => {

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      socket.emit("ping", "Hello server!");
    });

    socket.on("pong", (msg) => {
      console.log(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("pong");
    };
  }, []);

  return <div>Check console for Socket.IO logs</div>;
};

export default SocketTest;
