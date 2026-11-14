"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  SendHorizontal,
  Share2,
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FeedPost } from "./feed-types";
import { CURRENT_USER } from "./feed-data";

const commentSchema = z.object({
  comment: z.string().min(1, "Vui lòng nhập nội dung"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export interface FeedPostCardProps {
  post: FeedPost;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.recentComments);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comment: "",
    },
  });

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (nextState) {
      toast.success("Đã lưu bài viết vào bộ sưu tập cá nhân!");
    } else {
      toast.info("Đã xóa khỏi danh sách đã lưu");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(
        window.location.origin + `/post/${post.id}`
      );
      toast.success("Đã sao chép liên kết bài viết vào clipboard!");
    }
  };

  const onSubmitComment = (values: CommentFormValues) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author: CURRENT_USER,
      content: values.comment.trim(),
      createdAt: "Vừa xong",
      likesCount: 0,
    };
    setComments((prev) => [newComment, ...prev]);
    form.reset();
    toast.success("Đã đăng bình luận!");
  };

  return (
    <article className="border-border/70 bg-card/70 hover:border-border rounded-2xl border p-4 shadow-xs backdrop-blur-xs transition-colors sm:p-5">
      {/* 1. Post Header: Author info & options */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/cosplayer/${post.author.id}`}
            className="group ring-primary/20 hover:ring-primary/60 relative size-10 shrink-0 overflow-hidden rounded-full ring-2 transition-all sm:size-11"
          >
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              fill
              sizes="44px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </Link>

          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/cosplayer/${post.author.id}`}
                className="text-foreground hover:text-primary text-sm font-bold transition-colors"
              >
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <span className="bg-primary/20 text-primary flex size-4 items-center justify-center rounded-full">
                  <Check className="size-2.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span>{post.author.handle}</span>
              <span>•</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer rounded-lg p-1.5 transition-colors"
              aria-label="Tùy chọn bài viết"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
            <DropdownMenuItem
              onClick={handleShare}
              className="cursor-pointer text-xs"
            >
              <Share2 className="mr-2 size-4" />
              <span>Sao chép liên kết</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleToggleBookmark}
              className="cursor-pointer text-xs"
            >
              <Bookmark className="mr-2 size-4" />
              <span>{isBookmarked ? "Bỏ lưu bài viết" : "Lưu bài viết"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer text-xs">
              <span>Báo cáo bài viết</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Caption Text */}
      <p className="text-foreground/95 mt-3 text-xs leading-relaxed sm:text-sm">
        {post.caption}
      </p>

      {/* 3. Media Grid / Image Preview */}
      {post.images.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl">
          {post.images.length === 1 ? (
            <div className="border-border/60 bg-muted/30 relative aspect-[16/10] w-full overflow-hidden rounded-xl border">
              <Image
                src={post.images[0] || "/placeholder.svg"}
                alt="Cosplay artwork"
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover transition-transform hover:scale-[1.01]"
              />
            </div>
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((img, i) => (
                <div
                  key={i}
                  className="border-border/60 bg-muted/30 relative aspect-square overflow-hidden rounded-xl border"
                >
                  <Image
                    src={img}
                    alt={`Artwork ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 350px"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="border-border/60 bg-muted/30 relative col-span-2 aspect-[4/3] overflow-hidden rounded-xl border">
                <Image
                  src={post.images[0] || "/placeholder.svg"}
                  alt="Main artwork"
                  fill
                  sizes="(max-width: 768px) 70vw, 450px"
                  className="object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-2">
                {post.images.slice(1, 3).map((img, i) => (
                  <div
                    key={i}
                    className="border-border/60 bg-muted/30 relative flex-1 overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={img}
                      alt={`Artwork ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 30vw, 220px"
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 inline-flex cursor-pointer items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-medium transition-colors select-none"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 5. Interaction Action Bar */}
      <div className="border-border/50 text-muted-foreground mt-3.5 flex items-center justify-between border-t pt-2.5 text-xs">
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Like button */}
          <button
            type="button"
            onClick={handleToggleLike}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors ${
              isLiked
                ? "font-semibold text-red-500"
                : "hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Heart
              className={`size-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>Thích</span>
            {likesCount > 0 && <span className="ml-0.5">({likesCount})</span>}
          </button>

          {/* Comment button */}
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="hover:text-foreground hover:bg-muted/60 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <MessageCircle className="size-4" />
            <span>Bình luận</span>
            {comments.length > 0 && (
              <span className="ml-0.5">({comments.length})</span>
            )}
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="hover:text-foreground hover:bg-muted/60 flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Share2 className="size-4" />
            <span>Chia sẻ</span>
          </button>
        </div>

        {/* Bookmark / Save button */}
        <button
          type="button"
          onClick={handleToggleBookmark}
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors ${
            isBookmarked
              ? "text-primary font-semibold"
              : "hover:text-foreground hover:bg-muted/60"
          }`}
          title={isBookmarked ? "Bỏ lưu" : "Lưu vào bộ sưu tập"}
        >
          <Bookmark
            className={`size-4 ${isBookmarked ? "fill-primary text-primary" : ""}`}
          />
          <span className="hidden sm:inline">Lưu</span>
        </button>
      </div>

      {/* 6. Inline Comments Section */}
      <div className="border-border/40 mt-3 space-y-3 border-t pt-3">
        {/* Comment input form using shadcn Form */}
        <div className="flex items-center gap-2.5">
          <div className="border-primary/20 relative size-8 shrink-0 overflow-hidden rounded-full border">
            <Image
              src={CURRENT_USER.avatarUrl}
              alt={CURRENT_USER.name}
              fill
              sizes="32px"
              className="object-cover"
            />
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitComment)}
              className="flex flex-1 items-center gap-2"
            >
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem className="flex-1 space-y-0">
                    <FormControl>
                      <Input
                        placeholder="Viết bình luận cho tác phẩm..."
                        className="border-border/60 bg-muted/30 focus-visible:ring-primary/40 focus-visible:border-primary/60 h-8.5 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8.5 cursor-pointer rounded-xl px-3"
              >
                <SendHorizontal className="size-3.5" />
              </Button>
            </form>
          </Form>
        </div>

        {/* Recent comments list (collapsed or expanded) */}
        {comments.length > 0 && (
          <div className="space-y-2 pt-1">
            {comments
              .slice(0, showComments ? comments.length : 2)
              .map((cmt) => (
                <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                  <div className="border-border/60 relative size-7 shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={cmt.author.avatarUrl}
                      alt={cmt.author.name}
                      fill
                      sizes="28px"
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-muted/40 border-border/50 flex-1 rounded-xl border p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground font-bold">
                        {cmt.author.name}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {cmt.createdAt}
                      </span>
                    </div>
                    <p className="text-foreground/90 mt-0.5 leading-normal">
                      {cmt.content}
                    </p>
                  </div>
                </div>
              ))}

            {comments.length > 2 && !showComments && (
              <button
                type="button"
                onClick={() => setShowComments(true)}
                className="text-primary cursor-pointer text-xs font-medium hover:underline"
              >
                Xem thêm {comments.length - 2} bình luận khác...
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
