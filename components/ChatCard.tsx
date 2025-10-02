import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatUserProps = {
  name: string;
  lastMessage: string;
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
      className="cursor-pointer hover:bg-muted transition"
    >
      <CardContent className="flex items-center gap-3 p-0.5">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-[#9B5DE5] text-base capitalize">
            {name}
          </span>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {lastMessage}
          </span>
        </div>
        {unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatUserCard;
