"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { useSession } from "next-auth/react";
import AvatarUploader from "@/components/UploadButton";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Room = {
  name: string;
  description: string;
  avatar: string;
};

const CreateRoom = ({ open, onOpenChange }: Props) => {
  const { data: session } = useSession();

  const [roomDetails, setRoomDetails] = useState<Room>({
    name: "",
    description: "",
    avatar: "",
  });

  const handleCreate = async () => {
    console.log("Creating room:", roomDetails);
    if (!session?.user?.id) {
      alert("You must be signed in to create a room");
      return;
    }
    try {
      const res = await fetch(`/api/rooms/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomDetails),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Something went wrong");
        return;
      }

      alert("Room Created ✅");
      setRoomDetails({ name: "", description: "", avatar: "" });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Save failed:", err.message);
      } else {
        console.error("Save failed:", err);
      }
      alert("An unexpected error occurred");
    } finally {
      onOpenChange(false); // Close modal after submit
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new chat room</AlertDialogTitle>
          <AlertDialogDescription>
            Fill out the details below to create a new chat room. Room name,
            description, and avatar are required.
          </AlertDialogDescription>

          <div className="space-y-5">
            {/* Room Name */}
            <div className="grid w-full max-w-sm gap-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                type="text"
                value={roomDetails?.name}
                onChange={(e) =>
                  setRoomDetails({ ...roomDetails, name: e.target.value })
                }
              />
            </div>

            {/* Room Description */}
            <div className="grid w-full gap-2 max-w-sm">
              <Label htmlFor="description">Room Description</Label>
              <Textarea
                id="description"
                value={roomDetails?.description}
                onChange={(e) =>
                  setRoomDetails({
                    ...roomDetails,
                    description: e.target.value,
                  })
                }
              />
              <p className="text-muted-foreground text-sm">
                Describe the purpose of your room.
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="grid w-full max-w-sm gap-2">
              <AvatarUploader
                onUpload={(url) =>
                  setRoomDetails({ ...roomDetails, avatar: url })
                }
              />
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleCreate}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CreateRoom;
