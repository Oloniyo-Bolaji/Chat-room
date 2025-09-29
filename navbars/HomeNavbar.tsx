"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import IconTooltip from "@/ui-components/IconTooltip";
import { EllipsisVertical, Plus } from "lucide-react";
import Link from "next/link";
import CreateRoom from "@/components/CreateRoom";

const HomeNavbar = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <nav className="h-12 flex items-center justify-between px-5">
      <div>
        <h2 className="font-bold sm:text-xl text-base">Chats</h2>
      </div>
      <div className="h-12 flex items-center gap-5">
        {/* Button that opens dialog */}
        <Button variant="outline" onClick={() => setOpenDialog(true)}>
          <Plus />
        </Button>

        <Link href="/settings">
          <IconTooltip title="Settings" icon={<EllipsisVertical />} />
        </Link>
      </div>

      {/* Dialog lives here, controlled by state */}
      <CreateRoom open={openDialog} onOpenChange={setOpenDialog} />
    </nav>
  );
};

export default HomeNavbar;
