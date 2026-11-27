"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  FolderHeart,
  Plus,
  Trash2,
  Share2,
  Clock,
  Images,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCollectionSchema,
  type CreateCollectionFormValues,
} from "./schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  CollectionResDto,
  CollectionItemResDto,
} from "@/services/collections";
import { useTranslations } from "next-intl";
import {
  createCollection,
  deleteCollection,
  getCollectionItems,
  removeCollectionItem,
} from "@/services/collections";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface ProfileSavedCollectionsProps {
  initialCollections: CollectionResDto[];
  layout?: "compact" | "full";
}

export function ProfileSavedCollections({
  initialCollections,
  layout = "full",
}: ProfileSavedCollectionsProps) {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const queryClient = useQueryClient();
  const [collections, setCollections] =
    useState<CollectionResDto[]>(initialCollections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionResDto | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const form = useForm<CreateCollectionFormValues>({
    resolver: zodResolver(createCollectionSchema(t)),
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (initialCollections) {
      setCollections(initialCollections);
    }
  }, [initialCollections]);

  // Query real collection items when a collection is selected
  const { data: itemsRes, isLoading: isItemsLoading } = useQuery({
    queryKey: ["collection-items", selectedCollection?.id],
    queryFn: () => getCollectionItems(selectedCollection!.id, { limit: 50 }),
    enabled: !!selectedCollection?.id,
  });

  const collectionItems: CollectionItemResDto[] = itemsRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (values: CreateCollectionFormValues) =>
      createCollection({
        title: values.title.trim(),
        isPublic: true,
      }),
    onSuccess: async (created) => {
      setCollections((prev) => [created, ...prev]);
      form.reset();
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      toast.success(t("collectionCreated"));
    },
    onError: () => {
      toast.error(tCommon("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: async (_, collectionId) => {
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setSelectedCollection(null);
      await queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      toast.success(tCommon("confirm"));
    },
    onError: () => {
      toast.error(tCommon("error"));
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      removeCollectionItem(selectedCollection!.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collection-items", selectedCollection?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["my-collections"] });
      toast.success(tCommon("confirm"));
    },
    onError: () => {
      toast.error(tCommon("error"));
    },
  });

  const onSubmitCreate = (values: CreateCollectionFormValues) => {
    createMutation.mutate(values);
  };

  const handleDeleteCollection = (collectionId: string) => {
    deleteMutation.mutate(collectionId);
  };

  const handleShareCollection = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText?.(window.location.href);
      toast.success(t("copyUrlSuccess"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <h3
          className={cn(
            "text-foreground flex items-center gap-2 font-bold",
            layout === "full" ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          <FolderHeart className="text-primary size-4.5" />
          <span>{t("collectionsTab")}</span>
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="border-border/70 h-8 cursor-pointer gap-1.5 px-3 text-xs font-semibold"
        >
          <Plus className="size-3.5" />
          <span>{t("createCollection")}</span>
        </Button>
      </div>

      {/* Grid of collections */}
      <div
        className={cn(
          layout === "full"
            ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "space-y-3.5"
        )}
      >
        {collections.map((col) => {
          const uniqueThumbs = Array.from(
            new Set(col.previewThumbnails || [])
          ).filter(Boolean);

          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className="group border-border/70 bg-card hover:border-border relative flex cursor-pointer flex-col overflow-hidden rounded-xl border shadow-xs transition-colors"
            >
              {/* Mosaic Banner or Single Cover */}
              <div className="bg-muted relative aspect-[16/11] w-full overflow-hidden">
                {uniqueThumbs.length >= 3 ? (
                  /* 3+ distinct images: Mosaic grid */
                  <div className="grid h-full grid-cols-3 gap-1 p-1">
                    {/* Hero Left (2 cols) */}
                    <div className="relative col-span-2 h-full overflow-hidden rounded-l-lg">
                      <Image
                        src={uniqueThumbs[0] || ""}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 25vw"
                        className="object-cover object-top transition-opacity duration-300 group-hover:opacity-95"
                      />
                    </div>

                    {/* Stacked Right (1 col, 2 rows) */}
                    <div className="grid h-full grid-rows-2 gap-1">
                      <div className="relative h-full overflow-hidden rounded-tr-lg">
                        <Image
                          src={uniqueThumbs[1] || ""}
                          alt={col.title}
                          fill
                          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                          className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                        />
                      </div>
                      <div className="relative h-full overflow-hidden rounded-br-lg">
                        <Image
                          src={uniqueThumbs[2] || ""}
                          alt={col.title}
                          fill
                          sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                          className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                        />
                        {col.itemsCount > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-xs font-bold text-white/95 backdrop-blur-xs">
                            +{col.itemsCount - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : uniqueThumbs.length === 2 ? (
                  /* 2 distinct images: Half & Half */
                  <div className="grid h-full grid-cols-2 gap-1 p-1">
                    <div className="relative h-full overflow-hidden rounded-l-lg">
                      <Image
                        src={uniqueThumbs[0] || ""}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover object-top transition-opacity duration-300 group-hover:opacity-95"
                      />
                    </div>
                    <div className="relative h-full overflow-hidden rounded-r-lg">
                      <Image
                        src={uniqueThumbs[1] || ""}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                      />
                    </div>
                  </div>
                ) : uniqueThumbs.length === 1 ? (
                  /* Single distinct image: Clean Full Cover */
                  <div className="relative size-full overflow-hidden">
                    <Image
                      src={uniqueThumbs[0] || ""}
                      alt={col.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-opacity duration-300 group-hover:opacity-95"
                    />
                  </div>
                ) : (
                  <div className="bg-muted/40 flex h-full w-full items-center justify-center">
                    <FolderHeart className="text-muted-foreground/30 size-12" />
                  </div>
                )}

                <div className="from-card/80 pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t via-transparent to-transparent" />
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-foreground truncate text-sm font-bold">
                    {col.title.replace(/^"|"$/g, "")}
                  </h4>
                  <p className="text-muted-foreground text-xs font-medium">
                    {t("photosCount", { count: col.itemsCount })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {collections.length === 0 && (
        <div className="text-muted-foreground py-16 text-center">
          <FolderHeart className="mx-auto mb-2 size-8 opacity-40" />
          <p className="text-sm font-medium">{t("emptyCollections")}</p>
        </div>
      )}

      {/* Detail Dialog: View collection */}
      <Dialog
        open={Boolean(selectedCollection)}
        onOpenChange={(open) => {
          if (!open) setSelectedCollection(null);
        }}
      >
        <DialogContent className="border-border/80 bg-background/95 max-h-[90vh] overflow-hidden p-0 backdrop-blur-xl sm:max-w-4xl">
          {selectedCollection && (
            <div className="flex max-h-[90vh] flex-col">
              {/* Modal Header */}
              <DialogHeader className="border-border/70 border-b p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
                      <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-md">
                        <FolderHeart className="size-4.5" />
                      </div>
                      <span>
                        {selectedCollection.title.replace(/^"|"$/g, "")}
                      </span>
                    </DialogTitle>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span>
                        {t("photosCount", {
                          count: selectedCollection.itemsCount,
                        })}
                      </span>
                      {selectedCollection.updatedAt && (
                        <>
                          <span>•</span>
                          <span
                            className="flex items-center gap-1"
                            suppressHydrationWarning
                          >
                            <Clock className="size-3" />
                            {new Date(
                              selectedCollection.updatedAt
                            ).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleShareCollection}
                      className="border-border/70 h-8 gap-1.5 text-xs"
                    >
                      <Share2 className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDeleteCollection(selectedCollection.id)
                      }
                      className="h-8 gap-1.5 text-xs"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Grid */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {isItemsLoading ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <Loader2 className="text-primary size-7 animate-spin" />
                  </div>
                ) : collectionItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {collectionItems.map((item) => {
                      const mediaUrl =
                        item.mediaUrl || item.post?.coverUrl || "";
                      const isVideo = item.post?.postType === "video";
                      const postSlug = item.post?.slug || item.postId;

                      const cardInner = (
                        <>
                          {mediaUrl ? (
                            <Image
                              src={mediaUrl}
                              alt={item.post?.title || "Collection item"}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                            />
                          ) : (
                            <div className="bg-muted flex size-full items-center justify-center">
                              <Images className="text-muted-foreground/40 size-8" />
                            </div>
                          )}
                          {isVideo && (
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs backdrop-blur-md">
                              <Video className="size-3 text-pink-400" />
                              <span>Video</span>
                            </div>
                          )}
                          {item.post?.title && (
                            <>
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                              <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5">
                                <p className="truncate text-xs font-semibold text-white drop-shadow-xs">
                                  {item.post.title}
                                </p>
                              </div>
                            </>
                          )}
                          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeItemMutation.mutate(item.id);
                              }}
                              className="hover:bg-destructive flex size-7 items-center justify-center rounded-md bg-black/70 text-white backdrop-blur-xs transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </>
                      );

                      if (isVideo && postSlug) {
                        return (
                          <Link
                            key={item.id}
                            href={`/posts/${encodeURIComponent(String(postSlug).trim())}`}
                            onClick={() => setSelectedCollection(null)}
                            className="group border-border/60 bg-muted/30 relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-md"
                          >
                            {cardInner}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => mediaUrl && setActivePhoto(mediaUrl)}
                          className="group border-border/60 bg-muted/30 relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-md"
                        >
                          {cardInner}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-16 text-center">
                    <Images className="mx-auto mb-2 size-8 opacity-40" />
                    <p className="text-sm font-medium">{t("emptyAlbums")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox Modal: View single photo */}
      <Dialog
        open={Boolean(activePhoto)}
        onOpenChange={(open) => {
          if (!open) setActivePhoto(null);
        }}
      >
        <DialogContent className="border-none bg-black/95 p-2 backdrop-blur-2xl sm:max-w-4xl">
          {activePhoto && (
            <div className="relative flex flex-col items-center">
              <div className="relative aspect-[3/4] max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl">
                <Image
                  src={activePhoto}
                  alt="Full photo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-border/80 bg-background/95 backdrop-blur-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <FolderHeart className="text-primary size-5" />
              <span>{t("createCollection")}</span>
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitCreate)}
              className="space-y-4 pt-2"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {t("collectionTitle")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("collectionPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs font-semibold"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary text-primary-foreground text-xs font-semibold"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("createCollection")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
