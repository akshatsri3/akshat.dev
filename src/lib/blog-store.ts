"use client";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  likes: number;
}

const STORAGE_KEY = "portfolio_blogs";

export const getBlogs = (): BlogPost[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const isAdmin = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("portfolio_admin") === "true";
};

export const adminLogin = (passcode: string): boolean => {
  if (passcode.toLowerCase() === "akshat") {
    localStorage.setItem("portfolio_admin", "true");
    return true;
  }
  return false;
};

export const adminLogout = () => {
  localStorage.removeItem("portfolio_admin");
};

export const saveBlog = (blog: Omit<BlogPost, "id" | "date" | "likes">) => {
  const blogs = getBlogs();
  const newBlog: BlogPost = {
    ...blog,
    id: Math.random().toString(36).substring(2, 9),
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    likes: 0,
  };
  const updated = [newBlog, ...blogs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newBlog;
};

export const likeBlog = (id: string) => {
  const blogs = getBlogs();
  const updated = blogs.map((b) =>
    b.id === id ? { ...b, likes: b.likes + 1 } : b
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.find((b) => b.id === id);
};

export const deleteBlog = (id: string) => {
  const blogs = getBlogs();
  const updated = blogs.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
