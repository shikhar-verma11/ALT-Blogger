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
  authorUsername: string; // The unique handle (shikharverma113)
  authorName: string;     // The pretty display name (Shikhar Verma) - ADD THIS
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  likes: string[];
  saves: string[];
  coverImageUrl: string;
  hashtags: string[];
  commentCount: number;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorUsername: string;
    authorName?: string; 
    content: string;
    createdAt: Timestamp;
    parentId?: string | null; 
    replyToUsername?: string | null;
    replyToName?: string | null;  
}

export interface AuthUser extends Omit<User, 'password'> {
  emailVerified: boolean; 
  // Can be extended with more fields if needed, e.g., token
}