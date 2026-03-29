import { supabase } from "./supabase";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  created_at?: string;
}

export const getBlogs = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
  return data || [];
};

export const getBlogById = async (id: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
  return data;
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

export const saveBlog = async (blog: Omit<BlogPost, "id" | "date" | "likes">) => {
  const newBlog = {
    id: Math.random().toString(36).substring(2, 9),
    title: blog.title,
    content: blog.content,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    likes: 0,
  };

  const { data, error } = await supabase
    .from("blogs")
    .insert([newBlog])
    .select()
    .single();

  if (error) {
    console.error("Error saving blog:", error);
    throw error;
  }
  return data;
};

export const likeBlog = async (id: string, currentLikes: number) => {
  const { data, error } = await supabase
    .from("blogs")
    .update({ likes: currentLikes + 1 })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error liking blog:", error);
    return null;
  }
  return data;
};

export const deleteBlog = async (id: string) => {
  const { error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting blog:", error);
    throw error;
  }
};
