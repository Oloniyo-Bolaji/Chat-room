"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AvatarUpload from "@/components/UploadButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

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
  const [roomDetails, setRoomDetails] = useState<Room>({
    name: "",
    description: "",
    avatar: "",
  });

  const handleCreate = () => {
    console.log("Creating room:", roomDetails);

    // TODO: send to API or socket here
    // e.g. socket.emit("create-room", roomDetails)

    onOpenChange(false); // Close modal after submit
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create a new chat room</AlertDialogTitle>
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
              <Label htmlFor="avatar">Room Avatar</Label>
              <AvatarUpload
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
