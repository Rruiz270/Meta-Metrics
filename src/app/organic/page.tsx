"use client";

import { useEffect, useState } from "react";
import PostGrid from "@/components/PostGrid";
import KpiCard from "@/components/KpiCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatNumber } from "@/lib/utils";
import { Heart, MessageCircle, Eye, Bookmark } from "lucide-react";

interface Post {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
  permalink: string;
  insights: {
    impressions: number;
    reach: number;
    saved: number;
    shares: number;
  };
}

export default function OrganicPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/organic?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setPosts(d.media);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Error Loading Posts
        </h2>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
      </div>
    );
  }

  const totalLikes = posts.reduce((sum, p) => sum + p.like_count, 0);
  const totalComments = posts.reduce((sum, p) => sum + p.comments_count, 0);
  const totalReach = posts.reduce((sum, p) => sum + p.insights.reach, 0);
  const totalSaved = posts.reduce((sum, p) => sum + p.insights.saved, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Organic Posts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance metrics for Instagram posts
        </p>
      </div>

      {/* Totals */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Likes"
          value={formatNumber(totalLikes)}
          icon={Heart}
        />
        <KpiCard
          title="Total Comments"
          value={formatNumber(totalComments)}
          icon={MessageCircle}
        />
        <KpiCard
          title="Total Reach"
          value={formatNumber(totalReach)}
          icon={Eye}
        />
        <KpiCard
          title="Total Saved"
          value={formatNumber(totalSaved)}
          icon={Bookmark}
        />
      </div>

      {/* Post Grid */}
      <PostGrid posts={posts} />
    </div>
  );
}
