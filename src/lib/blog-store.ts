import { supabase } from "./supabase";

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  created_at?: string;
}

// Helper to get or create a persistent unique visitor ID
export const getVisitorId = (): string => {
  if (typeof window === "undefined") return "server-side";
  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    visitorId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

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

// Check if current user has liked a blog
export const hasUserLikedBlog = async (blogId: string): Promise<boolean> => {
  const visitorId = getVisitorId();
  const { data, error } = await supabase
    .from("blog_likes")
    .select("id")
    .eq("blog_id", blogId)
    .eq("visitor_id", visitorId)
    .single();
  
  return !!data;
};

// Get all blog IDs liked by the current user
export const getUserLikedBlogs = async (): Promise<string[]> => {
  const visitorId = getVisitorId();
  const { data, error } = await supabase
    .from("blog_likes")
    .select("blog_id")
    .eq("visitor_id", visitorId);
  
  if (error || !data) return [];
  return data.map(item => item.blog_id);
};

export const likeBlog = async (id: string, currentLikes: number) => {
  const visitorId = getVisitorId();
  
  // Try to insert a like record
  const { error: likeError } = await supabase
    .from("blog_likes")
    .insert([{ blog_id: id, visitor_id: visitorId }]);

  if (likeError) {
    // If it's a conflict (already liked), then "unlike"
    if (likeError.code === '23505') {
      await supabase
        .from("blog_likes")
        .delete()
        .eq("blog_id", id)
        .eq("visitor_id", visitorId);
      
      const { data } = await supabase
        .from("blogs")
        .update({ likes: Math.max(0, currentLikes - 1) })
        .eq("id", id)
        .select()
        .single();
      return data;
    }
    console.error("Error updating likes:", likeError);
    return null;
  }

  // If insert was successful, increment current count
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
