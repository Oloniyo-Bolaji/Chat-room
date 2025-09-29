import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const EditNavbar = () => {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <nav className="h-12 flex items-center justify-between">
      <div>
        <Button variant="link" onClick={handleBack}>
          <ChevronLeft />
        </Button>
      </div>

      <div>
        <h2 className="g:text-3xl sm:text-xl text-base font-bold">
          Edit Profile
        </h2>
      </div>

      <div></div>
    </nav>
  );
};

export default EditNavbar;
