import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { generateSuggestions } from '../services/geminiService';
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// You may need to declare the cloudinary global object for TypeScript
declare global {
  interface Window {
    cloudinary: any;
  }
}

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1.586l.293-.293a1 1 0 111.414 1.414l-1 1a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L6 4.586V3a1 1 0 011-1zM5.293 8.293a1 1 0 011.414 0L8 9.586V8a1 1 0 112 0v1.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414zM15 2a1 1 0 011 1v1.586l.293-.293a1 1 0 111.414 1.414l-1 1a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414L16 4.586V3a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);

const NewPostPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  
  const user = authContext?.user;

  // --- NEW: Function to handle image upload ---
  const handleImageUpload = () => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dpbx3ka0x', 
        uploadPreset: 'lnri23lf',  
        cropping: true, // Enable the cropping tool
        croppingAspectRatio: 16/9, // Set a 16:9 aspect ratio for cover photos
        multiple: false,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log('Done! Here is the image info: ', result.info);
          setCoverImageUrl(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const handleGenerateSuggestions = async () => {
    if (!content) {
        alert("Please write some content first to generate suggestions.");
        return;
    }
    setAiLoading(true);
    setTitleSuggestions([]);
    setHashtagSuggestions([]);
    const { titles, hashtags } = await generateSuggestions(content);
    setTitleSuggestions(titles);
    setHashtagSuggestions(hashtags);
    setAiLoading(false);
  };

  const toggleHashtag = (tag: string) => {
    setHashtags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (!title || !content || !user) {
      alert("Title, content, and user are required.");
      return;
    }
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        title: title,
        content: content,
        coverImageUrl: coverImageUrl,
        hashtags: hashtags,
        authorId: user.id,
        authorUsername: user.username,
        createdAt: serverTimestamp()
      });
      console.log("Post successfully saved to Firestore with ID: ", docRef.id);
      navigate('/');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("There was an error publishing your post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-8">
      <h1 className="font-display text-3xl font-bold text-light-text dark:text-dark-text mb-6">Create a New Post</h1>
      <div className="space-y-8">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle mb-1">Title</label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1 block w-full min-w-0 rounded-none rounded-l-lg px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple sm:text-sm text-light-text dark:text-dark-text"
              placeholder="Your Awesome Post Title"
            />
            <button
              onClick={handleGenerateSuggestions}
              disabled={aiLoading}
              className="relative inline-flex items-center space-x-2 px-4 py-2 border border-l-0 border-gray-300 dark:border-gray-700 text-sm font-medium rounded-r-lg text-light-text dark:text-dark-text bg-gray-50 dark:bg-dark-bg/50 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple disabled:opacity-50"
            >
              <SparklesIcon/>
              <span className="font-semibold">{aiLoading ? 'Generating...' : 'Suggest'}</span>
            </button>
          </div>
          {aiLoading && <div className="mt-2 text-sm text-light-subtle dark:text-dark-subtle">Thinking of some great ideas...</div>}
          {(titleSuggestions.length > 0 || hashtagSuggestions.length > 0) && (
             <div className="mt-3 p-4 bg-light-bg dark:bg-dark-bg/50 rounded-lg border border-gray-200 dark:border-gray-800 space-y-4">
               {/* ... suggestion buttons JSX is unchanged ... */}
             </div>
          )}
        </div>
        
        {/* --- THIS IS THE UPDATED IMAGE UPLOAD SECTION --- */}
        <div>
          <label className="block text-sm font-medium text-light-subtle dark:text-dark-subtle mb-2">Cover Image</label>
          {coverImageUrl && (
            <div className="mb-4">
              <img src={coverImageUrl} alt="Cover preview" className="rounded-lg max-h-60 w-full object-cover" />
            </div>
          )}
          <button
            onClick={handleImageUpload}
            className="w-full flex justify-center py-2 px-4 border border-dashed border-gray-400 dark:border-gray-600 rounded-lg text-sm font-medium text-light-subtle dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {coverImageUrl ? 'Change Image' : 'Upload an Image'}
          </button>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-light-subtle dark:text-dark-subtle mb-1">Content</label>
          <textarea
            id="content"
            rows={15}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple sm:text-sm text-light-text dark:text-dark-text"
            placeholder="Write your story..."
          />
        </div>
        <div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-semibold text-white bg-gradient-to-r from-brand-purple to-brand-yellow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple disabled:opacity-60 transition-all transform hover:scale-105"
          >
            {loading ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPostPage;