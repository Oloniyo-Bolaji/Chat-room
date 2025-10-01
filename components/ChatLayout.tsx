"use client";

import { useSocket } from "@/src/hooks/useSocket";
import React, { useEffect, useState } from "react";
import ChatUserCard from "./ChatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "@/src/types/user";

type Room = {
  id: string;
  roomName: string;
  description?: string;
  avatar?: string;
};

type ChatMessage = {
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
};

const ChatLayout = () => {
  const socket = useSocket();
  const { data: session } = useSession();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedChat, setSelectedChat] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch all rooms
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
      setAvailableRooms((prev) => [...prev, newRoom]);
    };

    socket.on("room_created", handleRoomCreated);

    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [socket]);

  // Fetch logged in user
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${session?.user?.id}`);
        const result = await res.json();

        if (result.success && result.data) {
          setUser(result.data);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      }
    };

    fetchUser();
  }, [session?.user?.id]);

  // Select a chat (load messages + room details)
  const selectChat = async (id: string) => {
    try {
      // Fetch messages
      const res = await fetch(`/api/rooms/${id}/messages`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }

      // Fetch room details
      const roomRes = await fetch(`/api/rooms/${id}`);
      const roomData = await roomRes.json();
      if (roomData.success) {
        setSelectedChat(roomData.data);
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
      alert("You must be signed in to send message to the room");
      return;
    }

    const msgPayload: ChatMessage & { roomId: string } = {
      roomId: selectedChat.id,
      text: message,
      sender: {
        id: user?.id || "guest",
        name: user?.name || "Anonymous",
        avatar: user?.image || "",
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/rooms/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);

      // Emit real-time update
      socket.emit("send_message", msgPayload);

      setMessage("");
    } catch (err) {
      console.error("Save failed:", err);
      alert("An unexpected error occurred");
    }
  };

  return (
    <div className="h-screen flex sm:px-10 px-5 py-10 sm:gap-5">
      {/* Chat list */}
      <div
        className={`w-full md:w-1/3 flex flex-col gap-2.5 ${
          selectedChat !== null ? "hidden md:block" : "block"
        }`}
      >
        <div className="w-full">
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
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.sender.id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        msg.sender.id === user?.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className="block text-xs opacity-70 mt-1">
                        {msg.sender.name}
                      </span>
                    </div>
                  </div>
                ))
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
