"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { User } from "@/src/types/user";
import EditNavbar from "@/navbars/EditNavbar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Page = () => {
  const params = useParams() as { id: string };
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        const result = await res.json();

        if (result.success && result.data) {
          setUser(result.data);
        } else {
          setError(result.error || "Failed to fetch user");
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
        setError("Failed to load user details");
      }
    };

    fetchUser();
  }, [id]);

  // Save handler
  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Something went wrong");
        return;
      }

      alert("Profile updated ✅");
      router.back();
    } catch (err) {
      console.error("Save failed:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!user) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <main className="px-10 py-2.5">
      <EditNavbar />
      <div className="w-full flex flex-col gap-5 py-10">
        <div className="space-y-5">
          {/* Username */}
          <div className="grid w-full gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={user.username || ""}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="grid w-full gap-2">
            <Label htmlFor="phoneNo">Phone No</Label>
            <Input
              id="phoneNo"
              type="text"
              value={user.phoneNo || ""}
              onChange={(e) => setUser({ ...user, phoneNo: e.target.value })}
            />
          </div>

          {/* Bio */}
          <div className="grid w-full gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={user.bio || ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="settings-input-group">
          <Label htmlFor="room-name">Profile Visibility</Label>
          <div className="flex justify-between items-center">
            <p className="text-sm">Allow others view your profile</p>
            <Switch
              checked={user.visibility ?? false}
              onCheckedChange={(checked) =>
                setUser({ ...user, visibility: checked })
              }
            />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button variant="success" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Page;
