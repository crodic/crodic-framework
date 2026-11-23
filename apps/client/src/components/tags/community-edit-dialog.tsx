"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Edit3, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  contributeTagEncyclopedia,
  type TagEncyclopediaResDto,
} from "@/services/tags";
import { useAuthStore } from "@/store/use-auth-store";

interface CommunityEditDialogProps {
  tagId: string;
  tagName: string;
  currentWiki?: TagEncyclopediaResDto | null;
  triggerButton?: React.ReactNode;
}

export function CommunityEditDialog({
  tagId,
  tagName,
  currentWiki,
  triggerButton,
}: CommunityEditDialogProps) {
  const t = useTranslations("Tags");
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(currentWiki?.summary || "");
  const [body, setBody] = useState(currentWiki?.body || "");
  const [changeNote, setChangeNote] = useState("");

  const editMutation = useMutation({
    mutationFn: async () => {
      return contributeTagEncyclopedia(tagId, {
        summary: summary.trim(),
        body: body.trim(),
        changeNote: changeNote.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Đóng góp bách khoa toàn thư đã được lưu thành công!");
      queryClient.invalidateQueries({ queryKey: ["tag-encyclopedia"] });
      queryClient.invalidateQueries({ queryKey: ["tag-detail"] });
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          "Không thể lưu đóng góp bách khoa toàn thư. Vui lòng thử lại!"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !body.trim()) {
      toast.error("Vui lòng nhập tóm tắt và nội dung bài viết.");
      return;
    }
    editMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer gap-1.5 text-xs font-semibold shadow-2xs"
          >
            <Edit3 className="text-primary size-3.5" />
            <span>{currentWiki ? t("editWiki") : t("contributeWiki")}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {currentWiki
                ? `Chỉnh sửa bách khoa toàn thư — #${tagName}`
                : `Đóng góp bài viết mới — #${tagName}`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mọi đóng góp từ cộng đồng đều được ghi nhận vào lịch sử phiên bản
              của bài viết. Vui lòng tuân thủ quy tắc ứng xử và trung thực về
              thông tin tác phẩm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Opening Summary Definition */}
            <div className="space-y-1.5">
              <Label htmlFor="summary" className="text-xs font-semibold">
                Tóm tắt định nghĩa (Summary)
              </Label>
              <Textarea
                id="summary"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Tóm tắt ngắn gọn 1-2 câu về nhân vật, xuất xứ và tạo hình..."
                className="text-xs leading-relaxed"
                required
              />
            </div>

            {/* Rich Body Content */}
            <div className="space-y-1.5">
              <Label htmlFor="body" className="text-xs font-semibold">
                Nội dung bách khoa toàn thư (Chi tiết lore & tạo hình)
              </Label>
              <Textarea
                id="body"
                rows={9}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nhập chi tiết về xuất thân, trang phục cosplay đặc trưng, các chi tiết nhận diện, trivia..."
                className="font-mono text-xs leading-relaxed"
                required
              />
              <p className="text-muted-foreground text-[11px]">
                Hỗ trợ định dạng văn bản và các đoạn HTML cơ bản.
              </p>
            </div>

            {/* Change Note */}
            <div className="space-y-1.5">
              <Label htmlFor="changeNote" className="text-xs font-semibold">
                Ghi chú thay đổi (Change note)
              </Label>
              <Input
                id="changeNote"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Ví dụ: Bổ sung nguồn gốc nhân vật, trang phục tiêu biểu..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                editMutation.isPending || !summary.trim() || !body.trim()
              }
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              {editMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Lưu & Đăng phiên bản mới</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
