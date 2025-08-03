export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // This would be a hash in a real app
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorUsername: string;
  createdAt: string;
  likes: string[]; // Array of user IDs
  saves: string[]; // Array of user IDs
  coverImageUrl: string;
  hashtags: string[];
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    authorUsername: string;
    content: string;
    createdAt: string;
}

export interface AuthUser extends Omit<User, 'password'> {
  // Can be extended with more fields if needed, e.g., token
}
