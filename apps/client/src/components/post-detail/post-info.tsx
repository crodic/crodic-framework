"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  Bookmark,
  Check,
  Heart,
  Plus,
  Send,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PostComment, PostDetail } from "./post-types";
import { cn } from "@/lib/utils";

interface PostInfoProps {
  post: PostDetail;
}

export function PostInfo({ post }: PostInfoProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [comments, setComments] = useState<PostComment[]>(post.comments);
  const [newCommentText, setNewCommentText] = useState("");

  const handleToggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
  };

  const handleToggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: PostComment = {
      id: `c-user-${Date.now()}`,
      authorName: "Bạn (Tôi)",
      authorAvatar: "/landing/avatar-kiriko.jpg",
      content: newCommentText.trim(),
      createdAt: "Vừa xong",
      likesCount: 0,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
  };

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      {/* 1. Header: Author Row (pr-12 leaves dedicated space for modal close button) */}
      <div className="border-border/50 flex items-center justify-between border-b pr-12 pb-3">
        <Link
          href={`/cosplayer/${post.author.name.toLowerCase() === "soriko" ? "soriko" : "kiriko"}`}
          className="group/author flex min-w-0 items-center gap-2.5"
        >
          <div className="border-border/80 bg-muted relative size-10 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground group-hover/author:text-primary truncate text-sm font-bold transition-colors">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <BadgeCheck className="size-4 shrink-0 fill-sky-400 text-sky-400" />
              )}
            </div>
            <p className="text-muted-foreground truncate text-xs">
              {post.author.handle}
            </p>
          </div>
        </Link>

        {/* Follow Button */}
        <Button
          type="button"
          size="sm"
          onClick={handleToggleFollow}
          className={cn(
            "h-8 shrink-0 rounded-xl px-3.5 text-xs font-semibold transition-all",
            isFollowing
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border border"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isFollowing ? (
            <>
              <Check className="mr-1 size-3.5" />
              Đang theo dõi
            </>
          ) : (
            <>
              <Plus className="mr-1 size-3.5" />
              Theo dõi
            </>
          )}
        </Button>
      </div>

      {/* 2. Caption Text */}
      <div className="space-y-3">
        <p className="text-foreground/90 text-sm leading-relaxed">
          {post.caption}
        </p>

        {/* Action Buttons: Thích, Lưu, Chia sẻ */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleLike}
            className={cn(
              "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
              isLiked
                ? "bg-rose-500/10 text-rose-500"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Heart
              className={cn(
                "size-3.5",
                isLiked && "fill-rose-500 text-rose-500"
              )}
            />
            <span>Thích</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleSave}
            className={cn(
              "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
              isSaved
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bookmark
              className={cn("size-3.5", isSaved && "fill-primary text-primary")}
            />
            <span>Lưu</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium"
          >
            <Share2 className="size-3.5" />
            <span>{copiedShare ? "Đã chép link!" : "Chia sẻ"}</span>
          </Button>
        </div>

        {/* Tags Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 rounded-lg border px-2.5 py-0.5 text-[11px] font-medium"
            >
              #{tag}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className="hover:bg-muted cursor-pointer rounded-lg px-2 py-0.5 text-[11px] font-medium"
          >
            + Thêm thẻ
          </Badge>
        </div>
      </div>

      {/* 3. Comments Section (Scrollable) */}
      <div className="border-border/40 flex min-h-0 flex-1 flex-col border-t pt-2">
        <h4 className="text-muted-foreground mb-2.5 flex items-center justify-between text-xs font-bold tracking-wider uppercase">
          <span>Comments ({comments.length})</span>
        </h4>

        <div className="max-h-[160px] flex-1 scrollbar-thin space-y-3 overflow-y-auto pr-1 sm:max-h-[220px]">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5 text-xs">
              <div className="bg-muted border-border/60 relative mt-0.5 size-7 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground font-semibold">
                    {comment.authorName}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {comment.createdAt}
                  </span>
                </div>
                <p className="text-foreground/80 mt-0.5 leading-snug">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Add Comment Input Form */}
      <form
        onSubmit={handleAddComment}
        className="border-border/50 flex items-center gap-2 border-t pt-2"
      >
        <div className="bg-muted border-border relative size-8 shrink-0 overflow-hidden rounded-full border">
          <Image
            src="/landing/avatar-kiriko.jpg"
            alt="Current User"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <div className="relative flex-1">
          <Input
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Viết bình luận..."
            className="bg-muted/40 border-border/60 h-9 rounded-xl pr-8 text-xs"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className="text-primary hover:text-primary/80 absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer disabled:pointer-events-none disabled:opacity-30"
            aria-label="Gửi bình luận"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
