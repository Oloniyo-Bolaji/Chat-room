import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/src/types";
import { formatChatTime } from "@/lib/formatDateandTime";

type ChatUserProps = {
  name: string;
  lastMessage: ChatMessage;
  avatarUrl?: string;
  unreadCount?: number;
  onClick: () => void;
};

const ChatUserCard = ({
  name,
  lastMessage,
  avatarUrl,
  unreadCount = 0,
  onClick,
}: ChatUserProps) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:bg-muted transition-colors border-none shadow-none"
    >
      <CardContent className="flex items-center justify-between p-3">
        {/* Left: Avatar + Name + Message */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col min-w-0">
            <span className="font-medium text-[#9B5DE5] text-base capitalize truncate">
              {name}
            </span>
            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
              {lastMessage?.text || "No messages yet"}
            </span>
          </div>
        </div>

        {/* Right: Time + Unread Badge */}
        <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
          <span className="text-xs text-muted-foreground">
            {lastMessage?.createdAt ? formatChatTime(lastMessage?.createdAt) : ""}
          </span>

          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatUserCard;
