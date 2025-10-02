"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/lib/icons/googleIcon";
import { signIn } from "next-auth/react";

const SignUp = () => {
  return (
    <div className="flex items-center justify-center h-screen mx-auto">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Sign in to ChatBoom</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2.5">
          <Button
            type="submit"
            variant="colored"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/Chat" })}
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/settings" })}
          >
            <GoogleIcon /> SIgn up with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
