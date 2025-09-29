"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { User } from "@/src/types/user";
import EditNavbar from "@/navbars/EditNavbar";

const Page = () => {
  const { id } = useParams();
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
        {/* Username */}
        <div className="settings-input-group">
          <label className="labels">Username</label>
          <input
            type="text"
            value={user.username || ""}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            className="settings-input"
          />
        </div>

        {/* Phone */}
        <div className="settings-input-group">
          <label className="labels">Phone No</label>
          <input
            type="text"
            value={user.phoneNo || ""}
            onChange={(e) => setUser({ ...user, phoneNo: e.target.value })}
            className="settings-input"
          />
        </div>

        {/* Bio */}
        <div className="settings-input-group">
          <label className="labels">Bio</label>
          <textarea
            value={user.bio || ""}
            onChange={(e) => setUser({ ...user, bio: e.target.value })}
            className="settings-input"
          />
        </div>

        {/* Visibility */}
        <div className="settings-input-group">
          <label className="labels">Profile Visibility</label>
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
