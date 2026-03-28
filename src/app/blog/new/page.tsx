"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Type, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveBlog, isAdmin } from "@/lib/blog-store";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useEffect } from "react";

export default function NewBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/blog");
    }
  }, [router]);

  const handleSave = () => {
    if (!title || !content) return;
    setIsSaving(true);
    saveBlog({ title, content });
    setTimeout(() => {
      router.push("/blog");
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-primary text-sm font-medium flex items-center gap-1 mb-8 hover:underline w-fit">
            <ArrowLeft className="size-4" /> Back to Blogs
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-12 rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl shadow-primary/5"
          >
            <div className="flex items-center gap-3 mb-8 text-primary/60">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="size-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest">Create New Post</span>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <Type className="size-4" /> Title
                </div>
                <input
                  type="text"
                  placeholder="Enter a compelling title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-3xl md:text-4xl font-bold tracking-tight border-none focus:ring-0 placeholder:text-muted-foreground/30 px-0"
                />
              </div>

              <div className="h-px bg-border/50" />

              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
                  <FileText className="size-4" /> Content
                </div>
                <textarea
                  placeholder="Tell your story..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-80 bg-transparent text-lg md:text-xl border-none focus:ring-0 placeholder:text-muted-foreground/30 px-0 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-12 border-t border-border/50 pt-8">
              <Link href="/blog">
                <Button variant="ghost" className="rounded-full gap-2 px-6">
                  <X className="size-4" /> Cancel
                </Button>
              </Link>
              <Button 
                onClick={handleSave} 
                disabled={!title || !content || isSaving}
                className="rounded-full gap-2 px-8 shadow-lg shadow-primary/20"
              >
                <Save className="size-4" /> {isSaving ? "Publishing..." : "Publish Post"}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
