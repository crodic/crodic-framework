"use client";

import React from "react";
import {
  Award,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CosplayerProfileData } from "./profile-types";

interface ProfileAboutProps {
  profile: CosplayerProfileData;
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Left 2 Columns: Bio, Specs & Skills */}
      <div className="space-y-6 md:col-span-2">
        {/* Detailed Biography Card */}
        <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <Sparkles className="text-primary size-4" />
              Tiểu sử nghệ thuật
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/90 space-y-4 text-sm leading-relaxed">
            <p>
              Xin chào! Mình là <strong>{profile.name}</strong>, một cosplayer
              tự do hoạt động từ năm 2021 tại Hà Nội. Với niềm đam mê dành cho
              anime, manga và các tựa game nổi tiếng như Genshin Impact, Honkai
              Star Rail, và vũ trụ Fate.
            </p>
            <p>
              Mỗi bộ ảnh cosplay đối với mình không chỉ là hóa trang đơn thuần,
              mà là hành trình tái hiện trọn vẹn thần thái, câu chuyện và cảm
              xúc của nhân vật từ thế giới 2D ra đời thực. Mình tự tay nghiên
              cứu chế tác đạo cụ (crafting props) và trau chuốt từng chi tiết
              phục trang để mang lại trải nghiệm mãn nhãn nhất cho khán giả.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="gap-1 rounded-lg py-1">
                <Award className="size-3 text-amber-500" />
                Top 3 Cosplay Contest Winter Fest 2024
              </Badge>
              <Badge variant="secondary" className="gap-1 rounded-lg py-1">
                <ShieldCheck className="size-3 text-sky-500" />
                CosSpace Verified Creator
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Specifications & Skills */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Specs */}
          <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                <Ruler className="text-primary size-4" />
                Thông số & Kinh nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs sm:text-sm">
              <div className="border-border/40 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground">Chiều cao:</span>
                <span className="text-foreground font-semibold">
                  {profile.details.height}
                </span>
              </div>
              <div className="border-border/40 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground">Kinh nghiệm:</span>
                <span className="text-foreground font-semibold">
                  {profile.details.experienceYears}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  Khu vực nhận việc:
                </span>
                <span className="text-foreground font-semibold">
                  Hà Nội & Toàn quốc
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                <Sparkles className="text-primary size-4" />
                Kỹ năng chuyên môn
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 pt-1">
              {profile.details.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="bg-background rounded-lg px-2.5 py-1 text-xs font-medium"
                >
                  <CheckCircle2 className="mr-1 size-3 text-emerald-500" />
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Services & Rate Sheet */}
        <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Calendar className="text-primary size-4" />
              Dịch vụ Booking & Hợp tác
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-foreground text-sm font-bold">
                  Chụp Photoset Studio / Ngoại cảnh
                </p>
                <p className="text-muted-foreground text-xs">
                  Phục trang chuẩn bị tỉ mỉ, diễn xuất theo concept yêu cầu
                </p>
              </div>
              <span className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-semibold">
                Theo thỏa thuận
              </span>
            </div>

            <div className="bg-muted/40 border-border/40 flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-foreground text-sm font-bold">
                  Khách mời Event / Biểu diễn Sân khấu Festival
                </p>
                <p className="text-muted-foreground text-xs">
                  Tham gia giao lưu, ký tặng người hâm mộ, catwalk và phỏng vấn
                </p>
              </div>
              <span className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-semibold">
                Nhận lịch trước 2 tuần
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Contact & Social Channels */}
      <div className="space-y-6">
        <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Mail className="text-primary size-4" />
              Kênh liên hệ chính thức
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
              <Mail className="text-muted-foreground size-4 shrink-0" />
              <div className="flex-1 truncate">
                <span className="text-muted-foreground block text-[11px]">
                  Email làm việc
                </span>
                <span className="text-foreground block truncate font-medium">
                  {profile.contact.email}
                </span>
              </div>
            </div>

            {profile.contact.phone && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
                <Phone className="text-muted-foreground size-4 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-muted-foreground block text-[11px]">
                    Điện thoại / Zalo
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.contact.phone}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
              <MapPin className="text-muted-foreground size-4 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Khu vực sinh sống
                </span>
                <span className="text-foreground font-medium">
                  {profile.location}
                </span>
              </div>
            </div>

            {/* Social links */}
            <div className="space-y-2 pt-2">
              <p className="text-muted-foreground text-xs font-semibold">
                Mạng xã hội
              </p>
              {profile.contact.facebook && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() =>
                    window.open(profile.contact.facebook, "_blank")
                  }
                >
                  <span>Facebook cá nhân</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
              {profile.contact.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() =>
                    window.open(profile.contact.instagram, "_blank")
                  }
                >
                  <span>Instagram @kirikocos</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
              {profile.contact.tiktok && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() => window.open(profile.contact.tiktok, "_blank")}
                >
                  <span>TikTok Channel</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
