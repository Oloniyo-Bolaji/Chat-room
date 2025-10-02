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
  avatar?: string;
  creatorId?: string;
};

export type ChatMessage = {
  text: string;
  senderId: string;
  timestamp: string;
  sender: User;
};
