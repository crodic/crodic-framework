"use client";

import React from "react";
import {
  Award,
  Mail,
  MapPin,
  Phone,
  Ruler,
  User,
  ExternalLink,
  CheckCircle2,
  Briefcase,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CosplayerDetailResDto } from "@/services/cosplayer";
import { useTranslations } from "next-intl";

interface ProfileAboutProps {
  profile: CosplayerDetailResDto;
}

export function ProfileAbout({ profile }: ProfileAboutProps) {
  const t = useTranslations("Profile");

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Left 2 Columns: Bio, Specs & Skills */}
      <div className="space-y-6 md:col-span-2">
        {/* Detailed Biography Card */}
        <Card className="border-border/60 bg-card/50 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
              <User className="text-primary size-4" />
              {t("aboutTab")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/90 space-y-4 text-sm leading-relaxed">
            <p>{profile.artisticBio || profile.bio || t("emptyBio")}</p>
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
          <Card className="border-border/60 bg-card/50 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                <Ruler className="text-primary size-4" />
                {t("experience")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs sm:text-sm">
              <div className="border-border/40 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground">{t("height")}:</span>
                <span className="text-foreground font-semibold">
                  {profile.heightLabel || "—"}
                </span>
              </div>
              <div className="border-border/40 flex items-center justify-between border-b py-1">
                <span className="text-muted-foreground">
                  {t("experience")}:
                </span>
                <span className="text-foreground font-semibold">
                  {profile.experienceLabel || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">
                  {t("locationLabel")}:
                </span>
                <span className="text-foreground font-semibold">
                  {profile.workArea || profile.locationLabel || "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-border/60 bg-card/50 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-bold">
                <User className="text-primary size-4" />
                {t("skills")}
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
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Column: Contact & Social Channels */}
      <div className="space-y-6">
        <Card className="border-border/60 bg-card/50 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Mail className="text-primary size-4" />
              {t("contact")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs sm:text-sm">
            {profile.contactEmail && (
              <div className="bg-muted/30 flex items-center gap-3 rounded-xl p-2.5">
                <Mail className="text-muted-foreground size-4 shrink-0" />
                <div className="flex-1 truncate">
                  <span className="text-muted-foreground block text-[11px]">
                    {t("emailLabel")}
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
                    {t("phoneLabel")}
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
                    {t("locationLabel")}
                  </span>
                  <span className="text-foreground font-medium">
                    {profile.locationLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Social links */}
            {(profile.facebookUrl ||
              profile.instagramUrl ||
              profile.tiktokUrl ||
              profile.twitterUrl) && (
              <div className="space-y-2 pt-2">
                <p className="text-muted-foreground text-xs font-semibold">
                  {t("socialChannels")}
                </p>
                {profile.facebookUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full cursor-pointer justify-between rounded-xl text-xs hover:border-blue-500/40 hover:text-blue-500"
                    onClick={() => window.open(profile.facebookUrl!, "_blank")}
                  >
                    <span className="flex items-center gap-2">
                      <Facebook className="size-3.5 text-blue-500" />
                      Facebook
                    </span>
                    <ExternalLink className="text-muted-foreground size-3.5" />
                  </Button>
                )}
                {profile.instagramUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full cursor-pointer justify-between rounded-xl text-xs hover:border-pink-500/40 hover:text-pink-500"
                    onClick={() => window.open(profile.instagramUrl!, "_blank")}
                  >
                    <span className="flex items-center gap-2">
                      <Instagram className="size-3.5 text-pink-500" />
                      Instagram
                    </span>
                    <ExternalLink className="text-muted-foreground size-3.5" />
                  </Button>
                )}
                {profile.tiktokUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:text-foreground h-9 w-full cursor-pointer justify-between rounded-xl text-xs"
                    onClick={() => window.open(profile.tiktokUrl!, "_blank")}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="size-3.5 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                      </svg>
                      TikTok
                    </span>
                    <ExternalLink className="text-muted-foreground size-3.5" />
                  </Button>
                )}
                {profile.twitterUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:text-foreground h-9 w-full cursor-pointer justify-between rounded-xl text-xs"
                    onClick={() => window.open(profile.twitterUrl!, "_blank")}
                  >
                    <span className="flex items-center gap-2">
                      <Twitter className="size-3.5" />X / Twitter
                    </span>
                    <ExternalLink className="text-muted-foreground size-3.5" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
