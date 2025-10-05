import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChatMessage } from "@/src/types";

type ChatMessageProp = {
  isMine: boolean;
  msg: ChatMessage;
};
const Message = ({ isMine, msg }: ChatMessageProp) => {
  return (
    <div
      className={`flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-2.5 ${
          isMine ? "justify-end flex-row-reverse" : "justify-start"
        }`}
      >
        <Avatar>
          <AvatarImage src={msg.sender.image} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <div
          className={`py-1 px-2 rounded-lg max-w-xs ${
            isMine ? "bg-[#9B5DE5] text-white" : "bg-[#9B5DE540] text-gray-900"
          }`}
        >
          <span className="block text-xs opacity-70 mt-1">
            {msg.sender?.username}
          </span>
          <p className="text-sm">{msg.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
