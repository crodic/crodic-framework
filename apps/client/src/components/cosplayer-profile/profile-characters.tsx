"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Images,
  Star,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Layers,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  deleteMyCharacter,
  type CosplayerCharacterResDto,
} from "@/services/cosplayer";
import { useTranslations } from "next-intl";
import { CharacterManageDialog } from "./character-manage-dialog";

interface ProfileCharactersProps {
  characters: CosplayerCharacterResDto[];
  isOwner?: boolean;
  onCharactersChange?: () => void;
}

export function ProfileCharacters({
  characters,
  isOwner = false,
  onCharactersChange,
}: ProfileCharactersProps) {
  const t = useTranslations("Profile");

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] =
    useState<CosplayerCharacterResDto | null>(null);

  // Delete confirmation state
  const [deletingCharacter, setDeletingCharacter] =
    useState<CosplayerCharacterResDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingCharacter(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (char: CosplayerCharacterResDto) => {
    setEditingCharacter(char);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCharacter) return;
    try {
      setIsDeleting(true);
      await deleteMyCharacter(deletingCharacter.id);
      toast.success(t("characterDeleted") || "Đã xóa nhân vật thành công");
      onCharactersChange?.();
    } catch {
      toast.error(t("characterDeleteError") || "Không thể xóa nhân vật này");
    } finally {
      setIsDeleting(false);
      setDeletingCharacter(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("completedCharacters", { count: characters.length })}
        </p>

        {isOwner && (
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold sm:h-9 sm:px-3.5 sm:text-sm"
          >
            <Plus className="size-3.5" />
            <span>{t("addCharacter") || "Thêm nhân vật"}</span>
          </Button>
        )}
      </div>

      {/* Empty State */}
      {characters.length === 0 ? (
        <div className="border-border/60 bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-12 text-center sm:py-16">
          <div className="bg-primary/10 text-primary mb-3 flex size-12 items-center justify-center rounded-xl sm:size-14">
            <UserRound className="size-6 sm:size-7" />
          </div>
          <h3 className="text-foreground text-sm font-semibold sm:text-base">
            {t("emptyCharactersTitle") || "Chưa có nhân vật nào trong hồ sơ"}
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed sm:text-sm">
            {t("emptyCharactersDesc") ||
              "Nhân vật sẽ tự động hiển thị khi bạn đăng bài cosplay mới có điền Tên nhân vật, hoặc bạn có thể chủ động tạo và chọn ảnh bìa đại diện ngay tại đây."}
          </p>
          {isOwner && (
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="mt-4 gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>{t("addFirstCharacter") || "Thêm nhân vật đầu tiên"}</span>
            </Button>
          )}
        </div>
      ) : (
        /* Characters Grid */
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group relative flex flex-col space-y-2 overflow-hidden rounded-xl"
            >
              {/* Character Thumbnail Container */}
              <div className="bg-muted/40 border-border/40 group-hover:border-primary/50 relative aspect-[3/4] w-full overflow-hidden rounded-xl border shadow-xs transition-all duration-300 group-hover:shadow-lg">
                {char.coverImageUrl ? (
                  <Image
                    src={char.coverImageUrl}
                    alt={char.characterName}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex size-full items-center justify-center">
                    <Layers className="size-8 opacity-40" />
                  </div>
                )}

                {/* Gradient Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* Badges top bar */}
                <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-center justify-between gap-1.5">
                  {/* Photos count */}
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 rounded-md border-white/10 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md sm:text-xs"
                  >
                    <Images className="size-3" />
                    <span>
                      {t("photosCount", { count: char.photosCount || 0 })}
                    </span>
                  </Badge>

                  {/* Owner Action Menu (3-dots) */}
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 rounded-md border border-white/10 bg-black/60 text-white backdrop-blur-md hover:bg-black/80 hover:text-white"
                        >
                          <MoreVertical className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(char)}
                          className="cursor-pointer gap-2"
                        >
                          <Pencil className="size-3.5" />
                          <span>{t("editCover") || "Đổi ảnh bìa / Sửa"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingCharacter(char)}
                          className="text-destructive focus:text-destructive cursor-pointer gap-2"
                        >
                          <Trash2 className="size-3.5" />
                          <span>{t("deleteCharacter") || "Xóa nhân vật"}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Character & Series Info over bottom of image */}
                <div className="absolute inset-x-3 bottom-3 space-y-0.5 text-white">
                  {char.seriesName && (
                    <span className="text-primary-foreground/90 bg-primary/80 inline-flex max-w-full items-center gap-1 truncate rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs sm:text-xs">
                      <Star className="size-2.5 shrink-0" />
                      <span className="truncate">{char.seriesName}</span>
                    </span>
                  )}
                  <h3 className="truncate text-sm font-bold text-white drop-shadow-sm sm:text-base">
                    {char.characterName}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Character Modal Dialog */}
      <CharacterManageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        character={editingCharacter}
        onSuccess={() => onCharactersChange?.()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingCharacter)}
        onOpenChange={(open) => !open && setDeletingCharacter(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteCharacterTitle") || "Xác nhận xóa nhân vật?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteCharacterConfirm") ||
                "Bạn có chắc muốn xóa nhân vật này khỏi hồ sơ không? Hành động này không thể hoàn tác."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel") || "Hủy"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete") || "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
