import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";

type ChatCardProps = {
  name: string;
  avatarUrl?: string;
  onClick: () => void;
};

const ChatJoinCard = ({ name, avatarUrl, onClick }: ChatCardProps) => {
  return (
    <Card className="cursor-pointer hover:bg-muted transition">
      <CardContent className="flex items-center justify-between py-0.5">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]"></span>
          </div>
        </div>

        <Button variant="outline" onClick={onClick}>
          Join Room
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChatJoinCard;
