import io from "socket.io-client";

const URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com"
    : "http://localhost:3000";

export const socket = io(URL, {
  path: "/api/socket",
});
