"use client";

import { DashboardSection } from "./sections/DashboardSection";
import { AnalyticsSection } from "./sections/AnalyticsSection";
import { UsersSection } from "./sections/UsersSection";
import { PostsSection } from "./sections/PostsSection";
import { SettingsSection } from "./sections/SettingsSection";

export function DashboardHome({ section }: { section: string }) {
  switch (section) {
    case "analytics":
      return <AnalyticsSection />;
    case "users":
      return <UsersSection />;
    case "posts":
      return <PostsSection />;
    case "settings":
      return <SettingsSection />;
    default:
      return <DashboardSection />;
  }
}
