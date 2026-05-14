"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type Post = {
  _id: string;
  postId: string;
  userId: string;
  userName: string;
  platform: string;
  content: string;
  hashtags: string[];
  likes: number;
  shares: number;
  comments: string[];
  createdAt: string;
};

export function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchPosts = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?page=${currentPage}&limit=12`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data);
        setTotalPages(json.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" })
      });
      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
        window.dispatchEvent(new Event("updateAnalytics"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", comment: commentText })
      });
      if (res.ok) {
        setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), commentText] } : p));
        setCommentText("");
        setActiveCommentPost(null);
        window.dispatchEvent(new Event("updateAnalytics"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">Browse all posts and their engagement metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1 || loading} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            disabled={page === totalPages || loading} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading posts...</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(
            posts.reduce((acc, post) => {
              const key = post.userName || post.userId;
              if (!acc[key]) acc[key] = [];
              acc[key].push(post);
              return acc;
            }, {} as Record<string, Post[]>)
          ).map(([userName, userPosts]) => (
            <div key={userName} className="space-y-4">
              <h3 className="text-xl font-semibold border-b pb-2">{userName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map((post) => (
                  <Card key={post._id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{post.userName || post.userId}</CardTitle>
                  </div>
                  <Badge variant="secondary">{post.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-sm flex-grow mb-4">{post.content}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-xs text-blue-500 font-medium">{tag}</span>
                  ))}
                </div>
                {post.comments && post.comments.length > 0 && (
                  <div className="mb-4 space-y-2 bg-muted/30 p-2 rounded-md">
                    <p className="text-xs font-semibold text-muted-foreground">Recent Comments:</p>
                    {post.comments.slice(0, 2).map((comment, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                        {comment}
                      </p>
                    ))}
                    {post.comments.length > 2 && (
                      <p className="text-xs text-muted-foreground/60 italic pl-2">
                        + {post.comments.length - 2} more...
                      </p>
                    )}
                  </div>
                )}
                
                {/* Interactions */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{(post.likes || 0).toLocaleString()}</span>
                  </button>
                  <button 
                    onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{(post.comments?.length || 0).toLocaleString()}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>{(post.shares || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Comment Input Box */}
                {activeCommentPost === post._id && (
                  <div className="pt-3 mt-3 border-t flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="flex-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleComment(post._id);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleComment(post._id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
