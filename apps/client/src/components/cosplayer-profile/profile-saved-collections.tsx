"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FolderHeart,
  Plus,
  X,
  Maximize2,
  Trash2,
  Heart,
  Share2,
  Clock,
  Images,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
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
import { CollectionPhoto, SavedCollection } from "./profile-types";
import { useTranslations } from "next-intl";
import { createCollection, deleteCollection } from "@/services/collections";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfileSavedCollectionsProps {
  initialCollections: SavedCollection[];
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
    useState<SavedCollection[]>(initialCollections);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  // Viewing full collection modal
  const [selectedCollection, setSelectedCollection] =
    useState<SavedCollection | null>(null);

  // Fullscreen Lightbox for individual photo
  const [activePhoto, setActivePhoto] = useState<CollectionPhoto | null>(null);

  const createMutation = useMutation({
    mutationFn: (values: CreateCollectionFormValues) =>
      createCollection({
        title: values.title.trim(),
        isPublic: true,
      }),
    onSuccess: async (created) => {
      const newCol: SavedCollection = {
        id: created.id,
        title: created.title,
        count: created.itemsCount || 0,
        thumbnails: created.previewThumbnails || [],
        photos: [],
        updatedAt: created.updatedAt,
      };

      setCollections((prev) => [newCol, ...prev]);
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

  const onSubmitCreate = (values: CreateCollectionFormValues) => {
    createMutation.mutate(values);
  };

  const handleRemovePhoto = (photoId: string) => {
    if (!selectedCollection) return;
    const updatedPhotos = (selectedCollection.photos || []).filter(
      (p) => p.id !== photoId
    );
    const updatedCol = {
      ...selectedCollection,
      photos: updatedPhotos,
      count: Math.max(0, selectedCollection.count - 1),
    };

    setSelectedCollection(updatedCol);
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCol.id ? updatedCol : c))
    );
  };

  const handleDeleteCollection = (collectionId: string) => {
    deleteMutation.mutate(collectionId);
  };

  const handleShareCollection = (col: SavedCollection) => {
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
          <span>
            {layout === "full"
              ? `${t("collectionsTab", { count: collections.length })}`
              : t("collectionsTab", { count: collections.length })}
          </span>
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="border-border/70 h-8 cursor-pointer gap-1.5 rounded-xl px-3 text-xs font-semibold"
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
          const hasThumbs = col.thumbnails && col.thumbnails.length > 0;

          return (
            <div
              key={col.id}
              onClick={() => setSelectedCollection(col)}
              className="group border-border/70 bg-card/60 hover:border-primary/50 hover:shadow-primary/10 relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border backdrop-blur-md transition-all duration-300 hover:shadow-xl"
            >
              {/* Mosaic Banner or Clean Placeholder */}
              <div className="bg-muted relative aspect-[16/11] w-full overflow-hidden">
                {hasThumbs ? (
                  <div className="grid h-full grid-cols-3 gap-1 p-1">
                    {/* Hero Left (2 cols) */}
                    <div className="relative col-span-2 h-full overflow-hidden rounded-l-2xl">
                      <Image
                        src={col.thumbnails[0] || ""}
                        alt={col.title}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 25vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Stacked Right (1 col, 2 rows) */}
                    <div className="grid h-full grid-rows-2 gap-1">
                      <div className="relative h-full overflow-hidden rounded-tr-2xl">
                        {col.thumbnails[1] && (
                          <Image
                            src={col.thumbnails[1]}
                            alt={col.title}
                            fill
                            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="relative h-full overflow-hidden rounded-br-2xl">
                        {col.thumbnails[2] && (
                          <Image
                            src={col.thumbnails[2]}
                            alt={col.title}
                            fill
                            sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 12vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        {/* Count Badge overlay on bottom-right thumbnail */}
                        {col.count > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-xs font-bold text-white/95 backdrop-blur-xs">
                            +{col.count - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/40 flex h-full w-full items-center justify-center">
                    <FolderHeart className="text-muted-foreground/30 size-12" />
                  </div>
                )}

                {/* Subtle gradient vignette at bottom */}
                <div className="from-card/80 pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t via-transparent to-transparent" />

                {/* Hover overlay hint */}
                <div className="bg-background/50 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100">
                  <span className="bg-primary text-primary-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-lg">
                    <Images className="size-4" />
                    {t("viewAlbum")}
                  </span>
                </div>
              </div>

              {/* Card Body: Info, Count & Folder Emblem */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
                      {col.title.replace(/^"|"$/g, "")}
                    </h4>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                      <span className="text-primary flex items-center gap-1 font-semibold">
                        <Images className="size-3.5" />
                        {t("photosCount", { count: col.count })}
                      </span>
                      {col.updatedAt && (
                        <>
                          <span className="text-muted-foreground/40">•</span>
                          <span>{col.updatedAt}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Folder Icon Emblem with smooth color transition */}
                  <div className="bg-primary/10 border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-all duration-300">
                    <FolderHeart className="size-4.5" />
                  </div>
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
        <DialogContent className="border-border/80 bg-background/95 max-h-[90vh] overflow-hidden rounded-3xl p-0 backdrop-blur-xl sm:max-w-4xl">
          {selectedCollection && (
            <div className="flex max-h-[90vh] flex-col">
              {/* Modal Header */}
              <DialogHeader className="border-border/70 border-b p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:text-2xl">
                      <div className="bg-primary/15 text-primary flex size-8 items-center justify-center rounded-xl">
                        <FolderHeart className="size-4.5" />
                      </div>
                      <span>
                        {selectedCollection.title.replace(/^"|"$/g, "")}
                      </span>
                    </DialogTitle>
                    <div className="text-muted-foreground flex items-center gap-3 text-xs">
                      <span>
                        {t("photosCount", { count: selectedCollection.count })}
                      </span>
                      {selectedCollection.updatedAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {selectedCollection.updatedAt}
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
                      onClick={() => handleShareCollection(selectedCollection)}
                      className="border-border/70 h-8 gap-1.5 rounded-xl text-xs"
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
                      className="h-8 gap-1.5 rounded-xl text-xs"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Grid */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {selectedCollection.photos &&
                selectedCollection.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {selectedCollection.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhoto(photo)}
                        className="group border-border/60 bg-muted/30 relative aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl border shadow-xs transition-all hover:shadow-md"
                      >
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(photo.id);
                            }}
                            className="hover:bg-destructive flex size-7 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-xs transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
              <div className="relative aspect-[3/4] max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="mt-3 flex w-full max-w-2xl items-center justify-between px-2 text-white">
                <div>
                  <h4 className="text-sm font-bold">{activePhoto.title}</h4>
                  <p className="text-xs text-white/70">
                    Cosplayer: {activePhoto.authorName}
                  </p>
                </div>
                {activePhoto.likesCount && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-white/10 text-white"
                  >
                    <Heart className="size-3 fill-rose-500 text-rose-500" />
                    <span>{activePhoto.likesCount}</span>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderHeart className="text-primary size-5" />
              {t("createCollection")}
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
                        className="h-10 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={createMutation.isPending}
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl"
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary text-primary-foreground cursor-pointer rounded-xl font-semibold"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {t("createCollection")}
                    </>
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
