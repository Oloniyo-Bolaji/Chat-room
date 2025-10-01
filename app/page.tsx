"use client";

import React from "react";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/lib/icons/googleIcon";

const page = () => {
  
  return (
    <div className="flex items-center justify-center h-screen mx-auto">
      <div className="rounded-xl shadow-lg flex flex-col px-10 py-5 gap-3.5 items-center">
        <h1 className="text-3xl font-bold">Welcome</h1>

        {/* Google Sign Up */}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/settings" })}
          className="inline-flex items-center w-[250px] justify-center gap-2.5 p-1.5 rounded-lg hover:bg-[#475c45] hover:text-white transition border border-[#475c45] text-[#475c45"
        >
          <GoogleIcon />
          Sign In with Google
        </button>

        {/* Divider */}
        <div className="flex items-center w-full max-w-[300px] gap-1.5 mx-auto">
          <div className="flex-1 border-t border-gray-400"></div>
          <span className="text-gray-600 text-sm font-medium">Or</span>
          <div className="flex-1 border-t border-gray-400"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={() => signIn("google",  { callbackUrl: "/Chat" })}
          className="rounded-lg w-[250px] p-1.5 bg-[#789678] text-white hover:bg-[#475c45] transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default page;
