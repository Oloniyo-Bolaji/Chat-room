export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  username: string;
  phoneNo: string;
  bio: string;
  visibility: boolean;
};

export type Room = {
  id: string;
  roomName: string;
  description?: string;
  messages: ChatMessage[];
  lastMessage: ChatMessage;
  avatar?: string;
  creatorId?: string;
};

export type ChatMessage = {
  text: string;
  roomId: string;
  senderId: string;
  timestamp: string;
  createdAt?: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image: string;
    username: string;
  };
};
