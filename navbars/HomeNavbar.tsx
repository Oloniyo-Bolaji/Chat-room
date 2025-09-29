import IconTooltip from "@/ui-components/IconTooltip";
import { EllipsisVertical, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const HomeNavbar = () => {
  return (
    <nav className="h-12 flex items-center justify-between px-5">
      <div>
        <h2 className="font-bold sm:text-xl text-base">Chats</h2>
      </div>
      <div className="h-12 flex items-center gap-5">
        <IconTooltip title="Create Room" icon={<Plus />} />

        <Link href="/settings">
          <IconTooltip title="Settings" icon={<EllipsisVertical />} />
        </Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;
