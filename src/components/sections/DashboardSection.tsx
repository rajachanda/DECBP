"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { Users, Heart, MessageCircle, Target } from "lucide-react";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

type AggregatedData = {
  _id: string; // The platform
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  postCount: number;
};

export function DashboardSection() {
  const [data, setData] = useState<AggregatedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const totalPosts = data.reduce((sum, item) => sum + item.postCount, 0);
  const sumLikes = data.reduce((sum, item) => sum + item.totalLikes, 0);
  const sumComments = data.reduce((sum, item) => sum + item.totalComments, 0);
  const sumShares = data.reduce((sum, item) => sum + item.totalShares, 0);

  const platformPostsData = {
    labels: data.map((d) => d._id),
    datasets: [
      {
        label: "Posts Stored",
        data: data.map((d) => d.postCount),
        backgroundColor: ["#1877f2", "#e4405f", "#1da1f2", "#0077b5", "#000000"],
      },
    ],
  };

  const engagementData = {
    labels: ["Likes", "Comments", "Shares"],
    datasets: [
      {
        label: "Total Engagement",
        data: [sumLikes, sumComments, sumShares],
        backgroundColor: ["#ef4444", "#f59e42", "#10b981"],
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Stored safely in MongoDB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sumLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sumComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sumShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Posts by Platform</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <Bar data={platformPostsData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Engagement Mix</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <Doughnut data={engagementData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: "bottom",
                    labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
                  }
                }
              }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Database Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Platform</th>
                  <th className="px-4 py-3">Total Posts</th>
                  <th className="px-4 py-3">Total Likes</th>
                  <th className="px-4 py-3">Total Comments</th>
                  <th className="px-4 py-3 rounded-r-lg">Total Shares</th>
                </tr>
              </thead>
              <tbody>
                {data.map((metric, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: platformPostsData.datasets[0].backgroundColor[index % 5] }} />
                      {metric._id}
                    </td>
                    <td className="px-4 py-3">{metric.postCount.toLocaleString()}</td>
                    <td className="px-4 py-3">{metric.totalLikes.toLocaleString()}</td>
                    <td className="px-4 py-3">{metric.totalComments.toLocaleString()}</td>
                    <td className="px-4 py-3">{metric.totalShares.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

