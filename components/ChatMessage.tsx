import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChatMessage } from "@/src/types";
import { formatChatTime } from "@/lib/formatDateandTime";

type ChatMessageProp = {
  msg: ChatMessage;
  isMine: string;
};

const Message = ({ msg, isMine }: ChatMessageProp) => {
  if (!msg?.text || msg.text.trim() === "") {
    console.warn("Empty message detected:", msg);
    return null;
  }

  const isSystem = msg?.sender?.id === "system";
  const isMyMessage = msg?.sender?.id === isMine;

  return (
    <div
      className={`flex ${
        isSystem
          ? "justify-center"
          : isMyMessage
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex gap-2.5 ${
          isMyMessage ? "justify-end flex-row-reverse" : "justify-start"
        }`}
      >
        <Avatar className={`${isSystem ? "hidden" : "block"}`}>
          <AvatarImage src={msg.sender?.image} />
          <AvatarFallback>
            {msg.sender?.username?.[0]?.toUpperCase() ||
              msg.sender?.name?.[0]?.toUpperCase() ||
              "?"}
          </AvatarFallback>
        </Avatar>
        <div
          className={`py-1 px-2 rounded-lg max-w-xs ${
            isSystem
              ? "bg-slate-400 text-black text-sm"
              : isMyMessage
              ? "bg-[#9B5DE5] text-white"
              : "bg-[#9B5DE540] text-gray-900"
          }`}
        >
          <span
            className={`${
              isSystem ? "hidden" : "block"
            } text-[10px] opacity-70 mt-1`}
          >
            {msg.sender?.username}
          </span>
          <p className="text-sm">{msg.text}</p>
          <span
            className={`${
              isSystem ? "hidden" : "block"
            } text-[8px] opacity-70 mt-1 text-right`}
          >
            {msg?.createdAt ? formatChatTime(msg?.createdAt) : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
