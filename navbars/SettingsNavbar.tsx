import IconTooltip from "@/ui-components/IconTooltip";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import React from "react";

const SettingsNavbar = () => {
  return (
    <nav className="h-12 flex items-center justify-between px-5">
      <div>
        <Link href="/">
          <IconTooltip title="Chats" icon={<MessageSquareText />} />
        </Link>
      </div>

      <div>
        <h2 className="lg:text-3xl sm:text-xl text-base font-bold">Settings</h2>
      </div>

      <div></div>
    </nav>
  );
};

export default SettingsNavbar;
