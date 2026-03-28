"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Calendar, User, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogs, type BlogPost, likeBlog, isAdmin, deleteBlog } from "@/lib/blog-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function BlogPostDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
    const allBlogs = getBlogs();
    const found = allBlogs.find((b) => b.id === id);
    if (found) {
      setBlog(found);
    } else {
      router.push("/blog");
    }
  }, [id, router]);

  const handleLike = () => {
    if (!blog) return;
    const updated = likeBlog(blog.id);
    if (updated) {
      setBlog(updated);
    }
  };

  const handleDelete = () => {
    if (!blog) return;
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteBlog(blog.id);
      router.push("/blog");
    }
  };

  if (!blog) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-12 text-sm text-muted-foreground font-medium">
            <Link href="/blog" className="hover:text-primary transition-colors">Blogs</Link>
            <ChevronRight className="size-4 text-muted-foreground/30" />
            <span className="text-foreground truncate max-w-[200px]">{blog.title}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {blog.date}
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <div className="flex items-center gap-1.5">
                  <User className="size-4" />
                  Akshat Srivastava
                </div>
              </div>
              <button 
                onClick={handleLike}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-all font-bold text-sm group"
              >
                <Heart className={`size-4 group-active:scale-125 transition-transform ${blog.likes > 0 ? "fill-primary" : ""}`} />
                {blog.likes}
              </button>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-10 leading-tight">
              {blog.title}
            </h1>

            <div className="prose prose-invert prose-lg max-w-none leading-relaxed text-zinc-400">
              {blog.content.split("\n\n").map((para, i) => (
                <p key={i} className="mb-6 whitespace-pre-wrap">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-20 pt-10 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={handleLike}
                    className={`p-3 rounded-full border transition-all duration-300 ${blog.likes > 0 ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-lg shadow-red-500/20" : "border-border hover:border-red-500/50 text-muted-foreground hover:text-red-500"}`}
                  >
                    <Heart className={`size-5 ${blog.likes > 0 ? "fill-current" : ""}`} />
                  </button>
                  <p className="text-xs font-medium text-muted-foreground">{blog.likes} {blog.likes === 1 ? 'like' : 'likes'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="rounded-full gap-2 px-6 border-border/50">
                  <Share2 className="size-4" /> Share
                </Button>
                {admin && (
                  <Button 
                    variant="outline" 
                    onClick={handleDelete}
                    className="rounded-full gap-2 px-6 border-red-500/20 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="size-4" /> Delete Post
                  </Button>
                )}
                <Link href="/blog">
                  <Button variant="ghost" className="rounded-full gap-2 px-6">
                    <ArrowLeft className="size-4" /> Back to List
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
