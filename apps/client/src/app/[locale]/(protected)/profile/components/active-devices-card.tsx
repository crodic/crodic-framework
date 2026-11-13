"use client";

import React, { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Globe,
  Laptop,
  Loader2,
  LogOut,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  extractErrorMessage,
  useRevokeAllOtherSessions,
  useRevokeSession,
  useSessions,
  useSignOut,
} from "@/hooks/use-profile";
import { UserSession } from "@/types/apis";

function parseDeviceFromUserAgent(userAgent?: string): {
  deviceType: "mobile" | "desktop" | "unknown";
  browserName: string;
  osName: string;
} {
  if (!userAgent) {
    return {
      deviceType: "unknown",
      browserName: "Unknown Browser",
      osName: "Unknown OS",
    };
  }

  const ua = userAgent.toLowerCase();

  // Device
  const isMobile = /mobile|iphone|ipod|android.*mobile|windows phone/.test(ua);
  const deviceType = isMobile ? "mobile" : "desktop";

  // OS
  let osName = "Unknown OS";
  if (ua.includes("windows")) osName = "Windows";
  else if (ua.includes("mac os") || ua.includes("macintosh")) osName = "macOS";
  else if (ua.includes("linux")) osName = "Linux";
  else if (ua.includes("android")) osName = "Android";
  else if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad"))
    osName = "iOS";

  // Browser
  let browserName = "Web Browser";
  if (ua.includes("edg/")) browserName = "Microsoft Edge";
  else if (ua.includes("chrome") && !ua.includes("chromium"))
    browserName = "Google Chrome";
  else if (ua.includes("firefox")) browserName = "Mozilla Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome"))
    browserName = "Apple Safari";

  return { deviceType, browserName, osName };
}

export function ActiveDevicesCard() {
  const t = useTranslations("Security.devices");
  const tSession = useTranslations("Security.session");
  const format = useFormatter();

  const { data: sessions = [], isLoading } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllMutation = useRevokeAllOtherSessions();
  const signOutMutation = useSignOut();

  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevokeSingle = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success(t("revokeSuccess"));
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to revoke session."));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllMutation.mutateAsync();
      toast.success(t("revokeAllSuccess"));
    } catch (error) {
      toast.error(
        extractErrorMessage(error, "Failed to revoke other sessions.")
      );
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  return (
    <div className="space-y-6">
      <Card className="border-border/60 rounded-2xl shadow-xs">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Laptop className="text-primary size-5" />
              <CardTitle className="text-lg font-semibold sm:text-xl">
                {t("title")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              {t("description")}
            </CardDescription>
          </div>

          {otherSessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={revokeAllMutation.isPending}
                  className="border-border/70 hover:bg-muted shrink-0 rounded-xl text-xs"
                >
                  {revokeAllMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      <span>{t("revoking")}</span>
                    </>
                  ) : (
                    <span>{t("revokeAllOther")}</span>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("revokeAllOtherConfirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("revokeAllOtherDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tSession("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleRevokeAll}
                  >
                    {tSession("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {/* Current Session */}
              {currentSession && (
                <SessionItem
                  session={currentSession}
                  format={format}
                  t={t}
                  isRevoking={false}
                  onRevoke={() => {}}
                />
              )}

              {/* Other Sessions */}
              {otherSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  format={format}
                  t={t}
                  isRevoking={revokingId === session.id}
                  onRevoke={() => handleRevokeSingle(session.id)}
                />
              ))}

              {sessions.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  {t("noOtherDevices")}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Standalone Sign Out Card */}
      <Card className="border-destructive/20 bg-destructive/5 rounded-2xl shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-destructive size-5" />
            <CardTitle className="text-destructive text-lg font-semibold">
              {tSession("title")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {tSession("description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-destructive/20 bg-card/60 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <p className="text-foreground text-sm font-semibold">
                {tSession("signOut")}
              </p>
              <p className="text-muted-foreground text-xs">
                {tSession("confirmDescription")}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={signOutMutation.isPending}
                  className="shrink-0 rounded-xl"
                >
                  {signOutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {tSession("signingOut")}
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 size-4" />
                      {tSession("signOut")}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {tSession("confirmTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {tSession("confirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tSession("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => signOutMutation.mutate()}
                  >
                    {tSession("confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionItem({
  session,
  format,
  t,
  isRevoking,
  onRevoke,
}: {
  session: UserSession;
  format: ReturnType<typeof useFormatter>;
  t: ReturnType<typeof useTranslations<"Security.devices">>;
  isRevoking: boolean;
  onRevoke: () => void;
}) {
  const { deviceType, browserName, osName } = parseDeviceFromUserAgent(
    session.userAgent
  );

  const createdAtFormatted = session.createdAt
    ? format.dateTime(new Date(session.createdAt), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : null;

  return (
    <div className="border-border/50 bg-background/50 hover:bg-background/80 flex flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5">
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          {deviceType === "mobile" ? (
            <Smartphone className="size-5" />
          ) : deviceType === "desktop" ? (
            <Laptop className="size-5" />
          ) : (
            <Globe className="size-5" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-foreground text-sm font-semibold">
              {browserName} on {osName}
            </span>
            {session.isCurrent ? (
              <Badge
                variant="outline-success"
                className="text-[11px] font-medium"
              >
                {t("currentDevice")} • {t("activeNow")}
              </Badge>
            ) : null}
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {session.ipAddress && (
              <span>
                {t("ip")}:{" "}
                <span className="font-mono">{session.ipAddress}</span>
              </span>
            )}
            {createdAtFormatted && (
              <span>
                {t("firstSeen")}: {createdAtFormatted}
              </span>
            )}
          </div>
        </div>
      </div>

      {!session.isCurrent && (
        <div className="shrink-0 pt-2 sm:pt-0">
          <Button
            variant="ghost"
            size="sm"
            disabled={isRevoking}
            onClick={onRevoke}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs"
          >
            {isRevoking ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                <span>{t("revoking")}</span>
              </>
            ) : (
              <span>{t("revoke")}</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
