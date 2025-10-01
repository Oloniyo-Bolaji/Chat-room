"use client";

import { useSocket } from "@/src/hooks/useSocket";
import React, { useEffect, useState } from "react";

type Room = {
  id: string;
  roomName: string;
  description?: string;
  avatar?: string;
};

const RoomsPage = () => {
  const socket = useSocket();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        console.log(data.joinedRooms);
        const rooms = data.joinedRooms;

        setJoinedRooms(rooms);
        setAvailableRooms(data.availableRooms);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (newRoom: Room) => {
      setAvailableRooms((prev) => [...prev, newRoom]);
    };

    socket.on("room_created", handleRoomCreated);

    // Cleanup
    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [socket]);

  return (
    <div>
      {joinedRooms.map((room) => {
        return <div key={room.id}>{room.roomName}</div>;
      })}
      {availableRooms.map((room) => {
        return <div key={room.id}>{room.roomName}</div>;
      })}
    </div>
  );
};

export default RoomsPage;
