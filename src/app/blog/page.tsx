"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Heart, ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogs, type BlogPost, likeBlog, isAdmin, adminLogout, deleteBlog } from "@/lib/blog-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      const data = await getBlogs();
      setBlogs(data);
    };
    fetchBlogs();
    setAdmin(isAdmin());
  }, []);

  const handleLike = async (id: string, currentLikes: number, e: React.MouseEvent) => {
    e.preventDefault();
    const updated = await likeBlog(id, currentLikes);
    if (updated) {
      setBlogs((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteBlog(id);
      const data = await getBlogs();
      setBlogs(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <Link href="/" className="text-primary text-sm font-medium flex items-center gap-1 mb-4 hover:underline">
                <ArrowLeft className="size-4" /> Back to Portfolio
              </Link>
              <h1
                className="text-6xl md:text-8xl font-normal tracking-normal text-gradient py-4"
                style={{ fontFamily: "var(--font-great-vibes), cursive" }}
              >
                My Blogs
              </h1>
              <p className="text-muted-foreground -mt-2 mb-4 text-lg font-medium italic tracking-wide">
                Notes from the mind
              </p>
              <p className="text-muted-foreground/60 text-sm max-w-md">
                Thoughts, tutorials, stories or lessons I learned...
              </p>
            </div>
            <div className="flex gap-3">
              {admin && (
                <>
                  <Button
                    variant="outline"
                    className="rounded-full gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      adminLogout();
                      window.location.reload();
                    }}
                  >
                    Logout
                  </Button>
                  <Link href="/blog/new">
                    <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
                      <Plus className="size-4" /> Write Post
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-8">
            {blogs.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-card/30">
                <MessageSquare className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No blogs yet.</p>
                {admin && (
                  <Link href="/blog/new" className="mt-4 inline-block">
                    <Button variant="outline" className="rounded-full">Start Writing</Button>
                  </Link>
                )}
              </div>
            ) : (
              blogs.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/blog/${blog.id}`}>
                    <div className="group p-8 rounded-3xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary/60">{blog.date}</span>
                        <div className="flex items-center gap-3">
                          {admin && (
                            <button
                              onClick={(e) => handleDelete(blog.id, e)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete Post"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleLike(blog.id, blog.likes, e)}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1 rounded-full"
                          >
                            <Heart className={`size-4 ${blog.likes > 0 ? "fill-primary text-primary" : ""}`} />
                            {blog.likes}
                          </button>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{blog.title}</h2>
                      <p className="text-muted-foreground line-clamp-2 mb-6">
                        {blog.content}
                      </p>
                      <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Read More <Plus className="size-4 rotate-45 ml-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
