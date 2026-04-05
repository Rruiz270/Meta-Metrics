"use client";

import { useState } from "react";
import { formatNumber, formatDate } from "@/lib/utils";
import { Heart, MessageCircle, Bookmark, Share2, Eye } from "lucide-react";

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

interface PostGridProps {
  posts: Post[];
}

type SortKey = "date" | "likes" | "reach" | "engagement";
type FilterType = "ALL" | "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export default function PostGrid({ posts }: PostGridProps) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [filterType, setFilterType] = useState<FilterType>("ALL");

  const filtered = posts.filter(
    (p) => filterType === "ALL" || p.media_type === filterType
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case "likes":
        return b.like_count - a.like_count;
      case "reach":
        return b.insights.reach - a.insights.reach;
      case "engagement":
        return (
          b.like_count +
          b.comments_count +
          b.insights.saved -
          (a.like_count + a.comments_count + a.insights.saved)
        );
      default:
        return 0;
    }
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
          >
            <option value="date">Date</option>
            <option value="likes">Likes</option>
            <option value="reach">Reach</option>
            <option value="engagement">Engagement</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Type:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
          >
            <option value="ALL">All</option>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Reel / Video</option>
            <option value="CAROUSEL_ALBUM">Carousel</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border bg-card shadow-sm hover:shadow-md"
          >
            {/* Thumbnail */}
            <div className="relative aspect-square overflow-hidden rounded-t-xl bg-muted">
              {(post.media_url || post.thumbnail_url) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.media_url || post.thumbnail_url}
                  alt={post.caption?.slice(0, 50) || "Post"}
                  className="h-full w-full object-cover group-hover:scale-105"
                  style={{ transition: "transform 300ms" }}
                />
              )}
              <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
                {post.media_type === "CAROUSEL_ALBUM"
                  ? "Carousel"
                  : post.media_type === "VIDEO"
                  ? "Reel"
                  : "Image"}
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4">
              <p className="mb-3 line-clamp-2 text-sm text-card-foreground">
                {post.caption || "No caption"}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {formatNumber(post.like_count)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {formatNumber(post.comments_count)}
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5" />
                  {formatNumber(post.insights.saved)}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-3.5 w-3.5" />
                  {formatNumber(post.insights.shares)}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatNumber(post.insights.reach)} reach
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDate(post.timestamp)}
              </p>
            </div>
          </a>
        ))}
        {sorted.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No posts found
          </div>
        )}
      </div>
    </div>
  );
}
