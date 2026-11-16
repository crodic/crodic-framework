"use client";

import React from "react";
import {
  Award,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Ruler,
  User,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CosplayerDetailResDto } from "@/services/cosplayer";

interface ProfileAboutProps {
  profile: CosplayerDetailResDto;
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
              <User className="text-primary size-4" />
              Tiểu sử nghệ thuật
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/90 space-y-4 text-sm leading-relaxed">
            <p>
              {profile.artisticBio ||
                profile.bio ||
                `Xin chào! Mình là ${profile.displayName}, cosplayer trên Kosume Platform.`}
            </p>
            {profile.awardsBadges && profile.awardsBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.awardsBadges.map((award, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1 rounded-lg py-1"
                  >
                    <Award className="size-3 text-amber-500" />
                    {award}
                  </Badge>
                ))}
              </div>
            )}
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
                  {profile.heightLabel || "Chưa cập nhật"}
                </span>
              </div>
              <div className="border-border/40 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground">Kinh nghiệm:</span>
                <span className="text-foreground font-semibold">
                  {profile.experienceLabel || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  Khu vực nhận việc:
                </span>
                <span className="text-foreground font-semibold">
                  {profile.workArea || profile.locationLabel || "Toàn quốc"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                <User className="text-primary size-4" />
                Kỹ năng chuyên môn
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 pt-1">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-border/80 bg-muted/30 rounded-lg text-xs font-medium"
                  >
                    <CheckCircle2 className="text-primary mr-1 size-3" />
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">
                  Chưa cập nhật kỹ năng
                </span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Services & Booking options */}
        {profile.services && profile.services.length > 0 && (
          <Card className="border-border/60 bg-card/50 rounded-2xl shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Calendar className="text-primary size-4" />
                Dịch vụ nhận hợp tác
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-muted/40 border-border/40 flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-bold">
                      {srv.title}
                    </p>
                    {srv.description && (
                      <p className="text-muted-foreground text-xs">
                        {srv.description}
                      </p>
                    )}
                  </div>
                  <span className="text-primary bg-primary/10 rounded-md px-2.5 py-1 text-xs font-semibold">
                    {srv.badgeLabel}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
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
            {profile.contactEmail && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
                <Mail className="text-muted-foreground size-4 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-muted-foreground block text-[11px]">
                    Email làm việc
                  </span>
                  <span className="text-foreground block truncate font-medium">
                    {profile.contactEmail}
                  </span>
                </div>
              </div>
            )}

            {profile.contactPhone && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
                <Phone className="text-muted-foreground size-4 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-muted-foreground block text-[11px]">
                    Điện thoại / Zalo
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.contactPhone}
                  </span>
                </div>
              </div>
            )}

            {profile.locationLabel && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
                <MapPin className="text-muted-foreground size-4 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Khu vực sinh sống
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.locationLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Social links */}
            <div className="space-y-2 pt-2">
              <p className="text-muted-foreground text-xs font-semibold">
                Mạng xã hội
              </p>
              {profile.facebookUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() => window.open(profile.facebookUrl!, "_blank")}
                >
                  <span>Facebook</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
              {profile.instagramUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() => window.open(profile.instagramUrl!, "_blank")}
                >
                  <span>Instagram</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
              {profile.tiktokUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() => window.open(profile.tiktokUrl!, "_blank")}
                >
                  <span>TikTok</span>
                  <ExternalLink className="text-muted-foreground size-3.5" />
                </Button>
              )}
              {profile.twitterUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-full justify-between rounded-xl text-xs"
                  onClick={() => window.open(profile.twitterUrl!, "_blank")}
                >
                  <span>Twitter / X</span>
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
