"use client";

import { useSocket } from "@/src/hooks/useSocket";
import React, { useEffect, useRef, useState } from "react";
import ChatUserCard from "./ChatCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { Room, ChatMessage, User } from "@/src/types";
import Message from "./ChatMessage";
import ChatJoinCard from "./ChatJoinCard";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ChatLayout = () => {
  const socket = useSocket();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  type Typers = {
    user: string;
    roomId: string;
    typing: boolean;
  };
  // States initialization
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedChat, setSelectedChat] = useState<Room | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  //Fetching the User details on load of page
  useEffect(() => {
    if (!currentUserId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${currentUserId}`);
        const result = await res.json();

        if (result.success && result.data) {
          const data = result.data;
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      }
    };

    fetchUser();
  }, [currentUserId]);

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

  useEffect(() => {
    if (!socket) return;

    //Data received from Socket is used to set room to joined or available depending on the creator
    const handleRoomCreated = (newRoom: Room) => {
      if (newRoom.creatorId && newRoom.creatorId === currentUserId) {
        setJoinedRooms((prev) => {
          if (prev.some((r) => r.id === newRoom.id)) return prev;
          return [...prev, newRoom];
        });
        setAvailableRooms((prev) => prev.filter((r) => r.id !== newRoom.id));
        return;
      }

      setAvailableRooms((prev) => {
        if (prev.some((r) => r.id === newRoom.id)) return prev;
        return [...prev, newRoom];
      });
    };

    socket.on("room_created", handleRoomCreated);

    return () => {
      socket.off("room_created", handleRoomCreated);
    };
  }, [socket, currentUserId, selectedChat]);

  const selectChat = async (id: string, skipSocketJoin = false) => {
    // Only rejoin the socket room if explicitly needed
    if (socket && !skipSocketJoin) {
      socket.emit("join_room", { roomId: id, silent: true });
      console.log(`Rejoined socket room: ${id}`);
    }

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

        // ✅ Only mark as read if there are messages
        if (data.messages.length > 0) {
          const lastMessage = data.messages[data.messages.length - 1];

          setJoinedRooms((prev) =>
            prev.map((room) =>
              room.id === id ? { ...room, unreadCount: undefined } : room
            )
          );
          // Mark the last message as read
          await fetch(`/api/rooms/${id}/message-read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lastReadMessageId: lastMessage.id,
              lastReadAt: new Date(),
            }),
          });
        }
      }
    } catch (err) {
      console.error("Error selecting chat:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    //Data received from Socket is used to update last message and unread count
    const handleOtherRoomMessage = (newMessage: ChatMessage) => {
      console.log("🔄 New message for unread count:", newMessage);
      if (!selectedChat || newMessage.roomId !== selectedChat.id) {
        setJoinedRooms((prev) =>
          prev.map((room) =>
            room.id === newMessage.roomId
              ? {
                  ...room,
                  unreadCount: (room.unreadCount || 0) + 1,
                  lastMessage: newMessage,
                }
              : room
          )
        );
      }
    };

    socket.on("new_message", handleOtherRoomMessage);

    return () => {
      socket.off("new_message", handleOtherRoomMessage);
    };
  }, [socket, selectedChat]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket) return;
    const handleCurrentChatMessage = (newMessage: ChatMessage) => {
      if (selectedChat && newMessage.roomId === selectedChat.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleUserJoined = (data: ChatMessage) => {
      console.log("🔔 user_joined event received:", data);
      if (data && data.text && data.text.trim()) {
        if (selectedChat && data.roomId === selectedChat.id) {
          setMessages((prev) => [...prev, data]);
        }
      }
    };

    // Register all listeners
    socket.on("receive_message", handleCurrentChatMessage);
    socket.on("user_joined", handleUserJoined);

    return () => {
      socket.off("receive_message", handleCurrentChatMessage);
      socket.off("user_joined", handleUserJoined);
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
      text: message.trim(),
      timestamp: new Date().toISOString(),
      sender: {
        id: session.user.id,
        name: session.user.name ?? "Unknown",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
        username: user?.username ?? "Anonymous",
      },
    };

    // Add message to local state immediately (optimistic update)
    setMessages((prev) => [...prev, msgPayload]);
    // Clear input immediately
    setMessage("");

    // Emit to socket (real-time for others)
    socket.emit("send_message", msgPayload);

    // Save in DB (background)
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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

      // Move the room from available to joined
      setAvailableRooms((prev) => prev.filter((r) => r.id !== roomId));

      setJoinedRooms((prev) => {
        if (prev.some((r) => r.id === roomId)) return prev;
        const room = availableRooms.find((r) => r.id === roomId);
        return room ? [...prev, room] : prev;
      });

      // Step 2: First, load room data and messages (skipSocketJoin=true)
      await selectChat(roomId, true);

      // Step 3: THEN join the socket.io room WITH user info (triggers system message)
      // This ensures the component is listening before the system message arrives
      if (socket) {
        if (socket.connected) {
          socket.emit("join_room", {
            roomId,
            userName: user?.username || session?.user?.name,
          });
        } else {
          socket.once("connect", () => {
            socket.emit("join_room", {
              roomId,
              userName: user?.username || session?.user?.name,
            });
          });
        }
      }

      return true;
    } catch (err) {
      console.error("Join room failed:", err);
      return false;
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket) return;
    setMessage(e.target.value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    socket.emit("user_typing", {
      user: user?.username,
      roomId: selectedChat?.id,
      typing: e.target.value ? true : false,
    });

    // Set timeout to stop typing after 2 seconds of inactivity
    if (e.target.value) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("user_typing", {
          user: user?.username,
          roomId: selectedChat?.id,
          typing: false,
        });
      }, 2000);
    }
  };

  // Listen for typing events
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleUserTyping = (data: Typers) => {
      if (data.roomId !== selectedChat.id) return;

      if (data.typing) {
        // Add user to typing list if not already there
        setTypingUsers((prev) => {
          if (!prev.includes(data.user)) {
            return [...prev, data.user];
          }
          return prev;
        });
      } else {
        // Remove user from typing list
        setTypingUsers((prev) => prev.filter((u) => u !== data.user));
      }
    };

    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("user_typing", handleUserTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-screen flex sm:gap-5 pt-15">
      {/* Chat list */}
      <div
        className={`w-full md:w-1/3 flex flex-col gap-2.5 py-1.5 px-2.5 bg-[#9B5DE560] ${
          selectedChat !== null ? "hidden md:block" : "block"
        }`}
      >
        {joinedRooms.map((room) => (
          <ChatUserCard
            key={room.id}
            name={room.roomName}
            lastMessage={room.lastMessage}
            unreadCount={room.unreadCount}
            avatarUrl={room.avatar}
            onClick={() => selectChat(room.id)}
          />
        ))}
        {availableRooms.map((room) => (
          <ChatJoinCard
            key={room.id}
            name={room.roomName}
            avatarUrl={room.avatar}
            onClick={() => joinRoom(room.id)}
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
                <div className="flex flex-col gap-1.5">
                  <p className="font-bold">{selectedChat.roomName}</p>
                  {typingUsers.length > 0 && (
                    <p className="text-sm text-gray-500 italic">
                      {typingUsers.length === 1
                        ? `${typingUsers[0]} is typing...`
                        : typingUsers.length === 2
                        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                        : `${typingUsers.length} people are typing...`}
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="link"
                className="md:hidden"
                onClick={() => setSelectedChat(null)}
              >
                Back
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isMine = session?.user?.id ?? "";
                  return <Message key={idx} isMine={isMine} msg={msg} />;
                })
              ) : (
                <p className="text-gray-500">No messages yet...</p>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex">
              <Input
                type="text"
                value={message}
                onChange={handleTyping}
                onKeyUpCapture={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 border rounded px-3 py-2"
              />
              <Button
                variant="colored"
                className="ml-2 px-4 py-2"
                onClick={sendMessage}
              >
                <Send />
              </Button>
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
