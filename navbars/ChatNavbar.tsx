"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import CreateRoom from "@/components/CreateRoom";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const ChatNavbar = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <nav className="h-15 flex items-center justify-between px-5 bg-[#9B5DE5]">
      <div>
        <h2 className="font-bold sm:text-xl text-base">Chats</h2>
      </div>
      <div className="h-12 flex items-center gap-2.5">
        {/* Button that opens create-room dialog */}
        <Button variant="outline" onClick={() => setOpenDialog(true)}>
          <Plus />
        </Button>

        <Button variant="link" onClick={() => router.push("/")}>
          <Bell />
        </Button>

        <Button variant="link" onClick={() => router.push("/settings")}>
          <Avatar>
            <AvatarImage src={session?.user?.image ?? ""} />
            <AvatarFallback>
              {session?.user?.name ? session.user.name.charAt(0) : "?"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Dialog lives here, controlled by state */}
      <CreateRoom open={openDialog} onOpenChange={setOpenDialog} />
    </nav>
  );
};

export default ChatNavbar;
