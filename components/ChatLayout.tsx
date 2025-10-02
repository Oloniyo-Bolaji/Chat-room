"use client";

import { useSocket } from "@/src/hooks/useSocket";
import React, { useEffect, useState } from "react";
import ChatUserCard from "./ChatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { User, Room, ChatMessage } from "@/src/types";
import ChatJoinCard from "./ChatJoinCard";

const ChatLayout = () => {
  const socket = useSocket();
  const { data: session } = useSession();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedChat, setSelectedChat] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch all rooms on page load
  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success) {
        setJoinedRooms(data.joinedRooms);
        setAvailableRooms(data.availableRooms);
      }
    };
    fetchRooms();
  }, []);

  // Listen for new rooms
  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = (newRoom: Room) => {
      // If creator , add to joinedRooms and remove from availableRooms
      if (newRoom.creatorId && newRoom.creatorId === session?.user?.id) {
        setJoinedRooms((prev) => {
          if (prev.some((r) => r.id === newRoom.id)) return prev;
          return [...prev, newRoom];
        });

        setAvailableRooms((prev) => prev.filter((r) => r.id !== newRoom.id));
        return;
      }

      // Otherwise add to availableRooms (if not already present)
      setAvailableRooms((prev) => {
        if (prev.some((r) => r.id === newRoom.id)) return prev;
        return [...prev, newRoom];
      });
    };

    socket.on("room_created", handleRoomCreated);
    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [socket, session?.user?.id]);

  // Select a chat (load messages + room details)
  const selectChat = async (id: string) => {
    try {
      // Fetch room details
      const roomRes = await fetch(`/api/rooms/${id}`);
      const roomData = await roomRes.json();
      if (roomData.success) {
        setSelectedChat(roomData.data);
      }
      // Fetch messages
      const res = await fetch(`/api/rooms/${id}/messages`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error selecting chat:", err);
    }
  };

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleReceiveMessage = (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, selectedChat]);

  // Send message
  const sendMessage = async () => {
    if (!socket || !selectedChat || !message.trim()) return;
    if (!session?.user?.id) {
      alert("You must be signed in to send a message");
      return;
    }

    const msgPayload = {
      roomId: selectedChat.id,
      senderId: session.user.id,
      text: message,
      timestamp: new Date().toISOString(),
    };

    // 1. Emit immediately (real-time)
    socket.emit("send_message", msgPayload);

    // 2. Save in DB (background)
    try {
      await fetch(`/api/rooms/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgPayload),
      });
    } catch (err) {
      console.error("Save failed:", err);
      alert("Message sent but not saved, please retry");
    }

    setMessage("");
  };

  const joinRoom = async (roomId: string) => {
    if (!session?.user?.id) {
      alert("You must be signed in to join a room");
      return false;
    }

    try {
      // Step 1: save to DB
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id, roomId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      // Step 2: join the socket.io room
      socket?.emit("join_room", roomId);

      setAvailableRooms((prev) => {
        // remove the room if it exists in availableRooms
        return prev.filter((r) => r.id !== roomId);
      });

      setJoinedRooms((prev) => {
        // only add if not already joined
        if (prev.some((r) => r.id === roomId)) return prev;
        const room = availableRooms.find((r) => r.id === roomId);
        return room ? [...prev, room] : prev;
      });

      return true;
    } catch (err) {
      console.error("Join room failed:", err);
      return false;
    }
  };

  return (
    <div className="h-screen flex sm:gap-5">
      {/* Chat list */}
      <div
        className={`w-full md:w-1/3 flex flex-col gap-2.5 py-1.5 px-2.5 bg-[#9B5DE540] ${
          selectedChat !== null ? "hidden md:block" : "block"
        }`}
      >
        {joinedRooms.map((room) => (
          <ChatUserCard
            key={room.id}
            name={room.roomName}
            lastMessage=""
            avatarUrl={room.avatar}
            onClick={() => selectChat(room.id)}
          />
        ))}
      </div>

      {/* Chat window */}
      <div
        className={`flex-1 ${
          selectedChat === null ? "hidden md:flex" : "flex"
        } flex-col`}
      >
        {selectedChat !== null ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Avatar>
                  <AvatarImage
                    src={selectedChat.avatar}
                    alt={selectedChat.roomName}
                  />
                  <AvatarFallback>
                    {selectedChat.roomName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="font-bold">{selectedChat.roomName}</p>
              </div>

              <button
                className="md:hidden text-blue-500"
                onClick={() => setSelectedChat(null)}
              >
                Back
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div
                      key={idx}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-lg max-w-xs ${
                          isMine
                            ? "bg-[#9B5DE5] text-white"
                            : "bg-[#9B5DE540] text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className="block text-xs opacity-70 mt-1">
                          {msg.sender?.name ?? "Unknown"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No messages yet...</p>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={sendMessage}
              >
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
