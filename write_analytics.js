const fs = require('fs');

const code = `"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Eye, MessageCircle, BarChart3, Target, Globe, Clock, Users } from "lucide-react";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

type AggregatedData = {
  _id: string;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  postCount: number;
};

type UserType = {
  _id: string;
  userId: string;
  name: string;
};

export function AnalyticsSection() {
  const [selectedUser, setSelectedUser] = useState("all");
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setUsersList(data.data);
        } else if (Array.isArray(data)) {
          setUsersList(data);
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  }, []);

  const fetchAnalytics = () => {
    setLoading(true);
    let url = "/api/analytics";
    if (selectedUser !== "all") {
      url += \`?userId=\${selectedUser}\`;
    }
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setAnalyticsData(json.data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
    const handleAnalyticsUpdate = () => fetchAnalytics();
    window.addEventListener("updateAnalytics", handleAnalyticsUpdate);
    return () => window.removeEventListener("updateAnalytics", handleAnalyticsUpdate);
  }, [selectedUser]);

  const totalPosts = analyticsData.reduce((sum, item) => sum + item.postCount, 0);
  const sumLikes = analyticsData.reduce((sum, item) => sum + item.totalLikes, 0);
  const sumComments = analyticsData.reduce((sum, item) => sum + item.totalComments, 0);
  const sumShares = analyticsData.reduce((sum, item) => sum + item.totalShares, 0);
  const totalEngagement = sumLikes + sumComments + sumShares;
  const reach = totalEngagement * 25;

  const engagementRateData = {
    labels: analyticsData.map(d => d._id),
    datasets: [
      {
        label: "Engagement Rate (%)",
        data: analyticsData.map(d => (d.postCount > 0 ? ((d.totalLikes + d.totalComments + d.totalShares) / d.postCount) : 0)),
        backgroundColor: ["#1877f2", "#e4405f", "#1da1f2", "#0077b5", "#000000"],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics & Insights</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Users className="h-5 w-5 text-muted-foreground mr-1" />
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Users / Global Overview</option>
            {usersList.map((user) => (
              <option key={user.userId || user._id} value={user.userId || user._id}>
                {user.name || user.userId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : reach.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Based on engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across selected profile</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Likes, Comments & Shares</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (totalPosts ? (totalEngagement / totalPosts).toFixed(1) : "0")}
            </div>
            <p className="text-xs text-muted-foreground">Interactions per post</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Engagement Metrics by Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <p className="text-muted-foreground">Gathering engagement data...</p>
            ) : analyticsData.length > 0 ? (
              <Bar 
                data={engagementRateData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } }
                }} 
              />
            ) : (
              <p className="text-muted-foreground">No engagement data found.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              Post Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {loading ? (
              <p className="text-muted-foreground">Calculating distribution...</p>
            ) : analyticsData.length > 0 ? (
              <Doughnut 
                data={{
                  labels: analyticsData.map(d => d._id),
                  datasets: [{
                    data: analyticsData.map(d => d.postCount),
                    backgroundColor: ["#1877f2", "#e4405f", "#1da1f2", "#0077b5", "#000000"]
                  }]
                }} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  cutout: '65%'
                }} 
              />
            ) : (
              <p className="text-muted-foreground">No distribution data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/components/sections/AnalyticsSection.tsx', code);
console.log('Done!');
