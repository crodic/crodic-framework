"use client";

import React, { useState } from "react";
import { Bell, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export function NotificationsSettings() {
  const [notifyNewPost, setNotifyNewPost] = useState(true);
  const [notifyInteractions, setNotifyInteractions] = useState(true);
  const [notifyFestivals, setNotifyFestivals] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Bell className="text-primary size-4" />
            <span>Thông báo trên hệ thống</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Tùy chọn nhận thông báo đẩy khi có hoạt động mới trên Kosume.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3.5">
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                Tác phẩm mới từ Cosplayer đang theo dõi
              </p>
              <p className="text-muted-foreground text-[11px]">
                Nhận thông báo ngay khi Kiriko, Soriko hoặc cosplayer bạn follow
                đăng photoset mới.
              </p>
            </div>
            <Switch
              checked={notifyNewPost}
              onCheckedChange={setNotifyNewPost}
            />
          </div>

          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                Tương tác bình luận & lượt thích
              </p>
              <p className="text-muted-foreground text-[11px]">
                Thông báo khi có ai đó phản hồi bình luận hoặc thả tim cho bộ
                sưu tập của bạn.
              </p>
            </div>
            <Switch
              checked={notifyInteractions}
              onCheckedChange={setNotifyInteractions}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Mail className="text-primary size-4" />
            <span>Thông báo qua Email</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Nhận tin tức tổng hợp và thông tin vé Festival qua hộp thư điện tử.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-xs font-semibold sm:text-sm">
                Bản tin Sự kiện & Festival Cosplay hàng tuần
              </p>
              <p className="text-muted-foreground text-[11px]">
                Gửi lịch trình festival tại Hà Nội & TP.HCM vào mỗi sáng thứ
                Hai.
              </p>
            </div>
            <Switch
              checked={notifyFestivals}
              onCheckedChange={setNotifyFestivals}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
