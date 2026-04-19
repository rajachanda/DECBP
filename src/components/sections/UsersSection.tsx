"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus, Users } from "lucide-react";

type User = {
  _id: string;
  name: string;
  role: string;
  email: string;
  status: string;
  baseFollowers: number;
  engagementRate: string;
  avgViewsPerPost: number;
  totalPosts: number;
  avgCommentsPerPost: number;
  avgLikesPerPost: number;
  highestViews: number;
  highestLikes: number;
  highestComments: number;
};

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {};
  const handleEdit = (id: string) => { console.log(id) };
  const handleDelete = (id: string) => { console.log(id) };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" /> User Management
        </h2>
        <Button onClick={handleAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user._id}>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex items-center justify-between text-base">
                <span>
                  {user.name} <span className="text-sm font-normal text-muted-foreground ml-1 bg-accent px-2 py-0.5 rounded-full">{user.role}</span>
                </span>
                <span
                  className={
                    user.status === "active"
                      ? "text-green-600 font-semibold"
                      : user.status === "invited"
                      ? "text-blue-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-4 w-full flex-1">
                  <p className="font-medium">{user.email}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground bg-accent/30 p-4 rounded-lg">
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Total Posts</span> {user.totalPosts}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Engagement Rate</span> {user.engagementRate}%</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Avg Views / Post</span> {user.avgViewsPerPost}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Highest Views</span> {user.highestViews}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Avg Likes / Post</span> {user.avgLikesPerPost}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Highest Likes</span> {user.highestLikes}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Avg Comments / Post</span> {user.avgCommentsPerPost}</div>
                    <div className="flex flex-col"><span className="font-semibold text-foreground">Highest Comments</span> {user.highestComments}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 md:self-end">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(user._id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(user._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
