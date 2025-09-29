import Settings from "@/components/Settings";
import SettingsNavbar from "@/navbars/SettingsNavbar";
import React from "react";

const Page = () => {
  return (
    <main className="px-10 py-2.5">
      <SettingsNavbar />
      <Settings />
    </main>
  );
};

export default Page;
