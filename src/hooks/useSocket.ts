"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export const useSocket = (): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io({
        path: "/api/socket",
      });
    }

    setSocket(socketInstance);

    // Cleanup only on full unload
    const handleBeforeUnload = () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return socket;
};
