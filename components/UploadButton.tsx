"use client";

import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/lib/useUploadThing";

export default function AvatarUpload({ onUpload }: { onUpload: (url: string) => void }) {
   const { startUpload, isUploading } = useUploadThing("roomAvatar");


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const res = await startUpload([e.target.files[0]]);
    if (res && res[0]) {
      onUpload(res[0].ufsUrl);
    }
  };

  return (
    <Input
      type="file"
      accept="image/*"
      disabled={isUploading}
      onChange={handleFileChange}
    />
  );
}
