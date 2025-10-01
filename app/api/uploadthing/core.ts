import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth"; 
import { authConfig } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  roomAvatar: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // 🔒 check session
      const session = await getServerSession(authConfig);
      if (!session?.user) throw new Error("Unauthorized");

      return { userId: session.user.id }; 
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
