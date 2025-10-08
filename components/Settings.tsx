"use client";

import { User } from "@/src/types";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Settings = () => {
  const { data: session } = useSession();
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${session.user.id}`);
        const result = await res.json();

        if (result.success && result.data) {
          const data = result.data;
          console.log(data);
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      }
    };

    fetchUser();
  }, [session?.user?.id]);

  const editProfile = () => {
    if (user?.id) {
      router.push(`/settings/edit/${user.id}`); // 👈 dynamic route with user id
    }
  };

  const { name, email, username, image, phoneNo, bio, visibility } = user ?? {};
  return (
    <section className="flex flex-col gap-5 justify-start px-10 py-5">
      {/**Name and Profile picture*/}
      <div className="flex gap-2.5">
        {/**Name and Profile picture*/}
        <div>
          {image && (
            <Image
              src={image}
              alt="Profile picture"
              width={50}
              height={50}
              className="rounded-full border-2 border-[#98b899]"
            />
          )}
        </div>
        <div>
          <h5 className="sm:text-base font-bold text-sm ">{name}</h5>
          <h6 className="sm:text-sm text-xs">{email}</h6>
        </div>
      </div>

      <div>
        <label className="labels">Username</label>
        <p className="label-info">{username ? username : "-"}</p>
      </div>

      <div>
        <label className="labels">Phone No</label>
        <p className="label-info">{phoneNo ? phoneNo : "-"}</p>
      </div>

      <div>
        <label className="labels">Bio</label>
        <p className="label-info">{bio ? bio : "-"}</p>
      </div>

      <div>
        <label className="labels">Profile Visibility</label>
        <p className="label-info">{visibility ? visibility : "-"}</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="dangerOutline">Delete Account</Button>
        <Button variant="success" onClick={editProfile}>Edit</Button>
      </div>

      <div>
        <Button variant="danger" onClick={() => signOut()}>
          LogOut
        </Button>
      </div>
    </section>
  );
};

export default Settings;
