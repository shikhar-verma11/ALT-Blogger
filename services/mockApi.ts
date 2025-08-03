import type { Post, User, AuthUser, Comment } from '../types';

// Helper to get items from localStorage
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// --- SIMULATE NETWORK DELAY ---
const ARTIFICIAL_DELAY = 500; // 500ms delay
const simulateNetwork = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, ARTIFICIAL_DELAY);
  });
}
// -----------------------------

// Initialize with some mock data if storage is empty
const initialPosts: Post[] = [
  {
    id: '1',
    title: 'The Future of AI in Web Development',
    content: 'Artificial intelligence is revolutionizing the way we build websites and applications. From automated testing to intelligent code completion, AI is becoming an indispensable tool for developers. This post explores the latest trends and what to expect in the near future.',
    authorId: '1',
    authorUsername: 'JaneDoe',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: ['2'],
    saves: [],
    coverImageUrl: 'https://images.unsplash.com/photo-1620712943543-2858200e9456?q=80&w=2070&auto=format&fit=crop',
    hashtags: ['AI', 'WebDev', 'FutureTech'],
  },
  {
    id: '2',
    title: 'A Deep Dive into React Hooks',
    content: 'React Hooks have fundamentally changed how we write React components. They allow us to use state and other React features without writing a class. This guide provides a deep dive into useState, useEffect, useContext, and custom hooks, with practical examples.',
    authorId: '2',
    authorUsername: 'JohnSmith',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: [],
    saves: ['1'],
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    hashtags: ['React', 'JavaScript', 'Frontend'],
  },
];

const initialUsers: User[] = [
    { id: '1', username: 'JaneDoe', email: 'jane@example.com', password: 'password123' },
    { id: '2', username: 'JohnSmith', email: 'john@example.com', password: 'password123' },
];

const initialComments: Comment[] = [
    { id: 'c1', postId: '1', authorId: '2', authorUsername: 'JohnSmith', content: 'Great overview! I\'m excited to see how AI continues to shape our field.', createdAt: new Date().toISOString() }
];


let posts: Post[] = getFromStorage('blog_posts', initialPosts);
let users: User[] = getFromStorage('blog_users', initialUsers);
let comments: Comment[] = getFromStorage('blog_comments', initialComments);

const syncPosts = () => window.localStorage.setItem('blog_posts', JSON.stringify(posts));
const syncUsers = () => window.localStorage.setItem('blog_users', JSON.stringify(users));
const syncComments = () => window.localStorage.setItem('blog_comments', JSON.stringify(comments));

// Initialize storage if it's empty
if (!window.localStorage.getItem('blog_posts')) syncPosts();
if (!window.localStorage.getItem('blog_users')) syncUsers();
if (!window.localStorage.getItem('blog_comments')) syncComments();

export const mockApi = {
  // Post API
  getPosts: async (): Promise<Post[]> => {
    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(sortedPosts);
  },
  getPost: async (id: string): Promise<Post | undefined> => {
    const post = posts.find(p => p.id === id);
    return simulateNetwork(post);
  },
  createPost: async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'saves'>): Promise<Post> => {
    const newPost: Post = {
      ...postData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      likes: [],
      saves: [],
    };
    posts = [newPost, ...posts];
    syncPosts();
    return simulateNetwork(newPost);
  },
  toggleLike: async (postId: string, userId: string): Promise<Post> => {
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");
    
    const post = posts[postIndex];
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
    } else {
        post.likes.push(userId);
    }
    posts[postIndex] = post;
    syncPosts();
    return simulateNetwork(post);
  },
  toggleSave: async (postId: string, userId: string): Promise<Post> => {
     const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) throw new Error("Post not found");
    
    const post = posts[postIndex];
    const saveIndex = post.saves.indexOf(userId);

    if (saveIndex > -1) {
        post.saves.splice(saveIndex, 1);
    } else {
        post.saves.push(userId);
    }
    posts[postIndex] = post;
    syncPosts();
    return simulateNetwork(post);
  },
  // User API
  signup: async (userData: Required<Pick<User, 'username' | 'email' | 'password'>>): Promise<AuthUser> => {
    if (users.some(u => u.email === userData.email)) throw new Error('Email already exists');
    if (users.some(u => u.username === userData.username)) throw new Error('Username already exists');
    
    const newUser: User = { ...userData, id: String(Date.now()) };
    users.push(newUser);
    syncUsers();
    
    // Return user object without the password
    const { password, ...authUser } = newUser;
    return simulateNetwork(authUser);
  },
  login: async (email: string, password_in: string): Promise<AuthUser | undefined> => {
    const user = users.find(u => u.email === email);
    // In a real app, you'd use bcrypt.compare(password, user.password)
    if (user && user.password === password_in) {
      const { password, ...authUser } = user;
      return simulateNetwork(authUser);
    }
    return simulateNetwork(undefined);
  },
  getUser: async (id: string): Promise<User | undefined> => {
      const user = users.find(u => u.id === id);
      return simulateNetwork(user);
  },
  // Comments API
  getCommentsForPost: async(postId: string): Promise<Comment[]> => {
    const postComments = comments.filter(c => c.postId === postId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return simulateNetwork(postComments);
  },
  addComment: async (commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    const newComment: Comment = {
      ...commentData,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    comments = [newComment, ...comments];
    syncComments();
    return simulateNetwork(newComment);
  }
};