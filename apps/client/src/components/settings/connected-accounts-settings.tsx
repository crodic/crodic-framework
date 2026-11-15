"use client";

import React, { useState } from "react";
import { Check, Link as LinkIcon, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ConnectedAccountsSettings() {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [facebookConnected, setFacebookConnected] = useState(true);
  const [discordConnected, setDiscordConnected] = useState(false);
  const [xConnected, setXConnected] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <LinkIcon className="text-primary size-4" />
            <span>Tài khoản liên kết đăng nhập</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Liên kết với các nền tảng mạng xã hội để đăng nhập nhanh chóng chỉ
            với 1 chạm.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Google */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="bg-background border-border/80 flex size-8 items-center justify-center rounded-lg border text-xs font-bold">
                G
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  Tài khoản Google
                </p>
                <p className="text-muted-foreground text-[11px]">
                  haianh.cosplay@gmail.com
                </p>
              </div>
            </div>
            {googleConnected ? (
              <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                <Check className="size-3" />
                Đã liên kết
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setGoogleConnected(true)}
                className="h-8 rounded-xl text-xs"
              >
                Liên kết
              </Button>
            )}
          </div>

          {/* Facebook */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                f
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  Tài khoản Facebook
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Hải Anh (Cosplay Fan)
                </p>
              </div>
            </div>
            {facebookConnected ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFacebookConnected(false)}
                className="text-muted-foreground hover:text-destructive h-8 gap-1 text-xs"
              >
                <Unlink className="size-3" />
                Hủy liên kết
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFacebookConnected(true)}
                className="h-8 rounded-xl text-xs"
              >
                Liên kết
              </Button>
            )}
          </div>

          {/* Discord */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#5865F2] text-xs font-bold text-white">
                D
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  Tài khoản Discord
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Chưa kết nối
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDiscordConnected(!discordConnected)}
              className="h-8 rounded-xl text-xs"
            >
              {discordConnected ? "Hủy liên kết" : "Liên kết"}
            </Button>
          </div>

          {/* X / Twitter */}
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border border-white/20 bg-black text-xs font-bold text-white">
                𝕏
              </div>
              <div>
                <p className="text-foreground text-xs font-semibold sm:text-sm">
                  Tài khoản X (Twitter)
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Chưa kết nối
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setXConnected(!xConnected)}
              className="h-8 rounded-xl text-xs"
            >
              {xConnected ? "Hủy liên kết" : "Liên kết"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
