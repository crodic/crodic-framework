"use client";

import React, { useState } from "react";
import { Check, KeyRound, Laptop, ShieldCheck, Smartphone } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ChangePasswordFormValues) => {
    setIsSaved(true);
    form.reset();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Change Password */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <KeyRound className="text-primary size-4" />
            <span>Đổi mật khẩu tài khoản</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Cập nhật mật khẩu định kỳ để bảo vệ tài khoản và bộ sưu tập của bạn.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-md space-y-4"
            >
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Mật khẩu hiện tại
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      Xác nhận mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {isSaved && (
                <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-500">
                  <Check className="size-4" />
                  <span>Mật khẩu đã được thay đổi thành công!</span>
                </div>
              )}

              <Button
                type="submit"
                className="bg-primary text-primary-foreground h-10 cursor-pointer rounded-xl px-5 text-xs font-semibold"
              >
                Cập nhật mật khẩu
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 2. Two-Factor Authentication (2FA) */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <ShieldCheck className="text-primary size-4" />
            <span>Xác thực 2 bước (2FA)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Bảo vệ tài khoản với một lớp bảo mật bổ sung qua mã OTP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/40 border-border/50 flex items-center justify-between rounded-xl border p-3.5">
            <div className="space-y-0.5 pr-4">
              <p className="text-foreground text-sm font-semibold">
                Xác thực qua ứng dụng (Google Authenticator / Authy)
              </p>
              <p className="text-muted-foreground text-xs">
                Yêu cầu mã 6 số từ ứng dụng bảo mật mỗi khi đăng nhập trên thiết
                bị mới.
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Active Sessions */}
      <Card className="border-border/70 bg-card/60 rounded-2xl shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Laptop className="text-primary size-4" />
            <span>Thiết bị đang hoạt động</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Danh sách các thiết bị hiện đang đăng nhập vào tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/30 border-border/40 flex items-center justify-between rounded-xl border p-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Laptop className="size-4" />
              </div>
              <div>
                <p className="text-foreground font-semibold">
                  Chrome trên MacOS (Thiết bị hiện tại)
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Hà Nội, Việt Nam • Đang hoạt động
                </p>
              </div>
            </div>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500">
              Hiện tại
            </span>
          </div>

          <div className="bg-muted/30 border-border/40 flex items-center justify-between rounded-xl border p-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="bg-muted text-muted-foreground flex size-8 items-center justify-center rounded-lg">
                <Smartphone className="size-4" />
              </div>
              <div>
                <p className="text-foreground font-semibold">
                  Kosume App trên iPhone 15 Pro
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Hà Nội, Việt Nam • 2 giờ trước
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
            >
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
