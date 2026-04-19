"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2 } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
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
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments.length.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
