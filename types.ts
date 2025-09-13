import { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  createdAt: Timestamp; // Use the correct Firestore Timestamp type
  updatedAt?: Timestamp; // Add optional updatedAt
  likes: string[];
  saves: string[];
  coverImageUrl: string;
  hashtags: string[];
  commentCount: number; // Add commentCount
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorUsername: string;
    content: string;
    createdAt: Timestamp; // Use the correct Firestore Timestamp type
}

export interface AuthUser extends Omit<User, 'password'> {
  emailVerified: boolean; 
  // Can be extended with more fields if needed, e.g., token
}