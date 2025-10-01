"use client";

import { genUploader } from "uploadthing/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Loading from "@/ui-components/Loading";

interface AvatarUploaderProps {
  onUpload: (url: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const { uploadFiles } = genUploader();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setFile(selectedFile);
    setUploaded(false);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setLoading(true);
    setUploaded(false);

    try {
      const res = await uploadFiles("roomAvatar", { files: [file] });
      const url = res?.[0]?.ufsUrl;

      if (url) {
        onUpload(url);
        setUploaded(true);
        alert("Image uploaded successfully!");
      } else {
        alert("Upload failed: no URL received");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        alert("Upload failed: " + err.message);
      } else {
        console.error(err);
        alert("Upload failed: Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Label>Upload Avatar</Label>

      {/* File input */}
      <Input
        type="file"
        accept="image/*"
        id="avatar-input"
        onChange={handleFileChange}
      />

      {/* Buttons */}
      <div className="flex gap-2">
        {file && (
          <Button
            variant="success"
            onClick={handleUpload}
            disabled={loading || uploaded}
          >
            {loading ? <Loading /> : uploaded ? "✅" : "Upload"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvatarUploader;
