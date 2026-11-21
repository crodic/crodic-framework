"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AlertCircle, BadgeCheck, Clock, Loader2, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TagChipsInput } from "@/components/ui/tag-chips-input";
import {
  getMyCosplayerApplication,
  submitCosplayerApplication,
  type CreateCosplayerApplicationDto,
} from "@/services/cosplayer-application";

const createCosplayerApplicationFormSchema = (t: any) =>
  z.object({
    stageName: z.string().trim().min(1, t("valStageNameRequired")),
    bio: z.string().trim().min(20, t("valBioMin")),
    facebookUrl: z.string().trim().optional(),
    instagramUrl: z.string().trim().optional(),
    tiktokUrl: z.string().trim().optional(),
    twitterUrl: z.string().trim().optional(),
    portfolioUrls: z.array(z.string()),
  });

type CosplayerApplicationFormValues = z.infer<
  ReturnType<typeof createCosplayerApplicationFormSchema>
>;

interface CosplayerApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  isEmailVerified?: boolean;
  initialStageName?: string;
}

export function CosplayerApplicationDialog({
  open,
  onOpenChange,
  userEmail,
  isEmailVerified = true,
  initialStageName = "",
}: CosplayerApplicationDialogProps) {
  const t = useTranslations("CosplayerApplication");
  const queryClient = useQueryClient();
  const [isReapplying, setIsReapplying] = useState(false);

  const { data: application, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["cosplayer-application-me"],
    queryFn: getMyCosplayerApplication,
    enabled: open,
  });

  const schema = useMemo(() => createCosplayerApplicationFormSchema(t), [t]);

  const form = useForm<CosplayerApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      stageName: initialStageName,
      bio: "",
      facebookUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      twitterUrl: "",
      portfolioUrls: [],
    },
  });

  useEffect(() => {
    if (initialStageName && !form.getValues("stageName")) {
      form.setValue("stageName", initialStageName);
    }
  }, [initialStageName, form]);

  const submitMutation = useMutation({
    mutationFn: submitCosplayerApplication,
    onSuccess: () => {
      toast.success(t("toastSuccess"));
      void queryClient.invalidateQueries({
        queryKey: ["cosplayer-application-me"],
      });
      void queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsReapplying(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("toastError"));
    },
  });

  const onSubmit = (values: CosplayerApplicationFormValues) => {
    if (!isEmailVerified) {
      toast.error(t("toastVerifyEmail"));
      return;
    }

    const payload: CreateCosplayerApplicationDto = {
      stageName: values.stageName.trim(),
      bio: values.bio.trim(),
      socialLinks: {
        facebook: values.facebookUrl?.trim() || undefined,
        instagram: values.instagramUrl?.trim() || undefined,
        tiktok: values.tiktokUrl?.trim() || undefined,
        twitter: values.twitterUrl?.trim() || undefined,
      },
      portfolioUrls:
        values.portfolioUrls.length > 0 ? values.portfolioUrls : undefined,
    };

    submitMutation.mutate(payload);
  };

  const isPending = application?.status === "PENDING";
  const isApproved = application?.status === "APPROVED";
  const isRejected = application?.status === "REJECTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <BadgeCheck className="text-primary size-5" />
            {t("dialogTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("dialogDesc")}
          </DialogDescription>
        </DialogHeader>

        {isLoadingStatus ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="text-primary size-6 animate-spin" />
          </div>
        ) : isPending && !isReapplying ? (
          /* STATUS: PENDING */
          <div className="space-y-4 py-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Clock className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-amber-700 dark:text-amber-300">
                {t("pendingTitle")}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("pendingDesc")}
              </p>
            </div>

            <div className="bg-muted/40 space-y-2 rounded-xl p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("stageNameSubmitted")}
                </span>
                <span className="font-semibold">{application?.stageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("submittedAt")}
                </span>
                <span>
                  {application?.createdAt
                    ? new Date(application.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("statusLabel")}
                </span>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  {t("statusPending")}
                </Badge>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl sm:w-auto"
              >
                {t("closeBtn")}
              </Button>
            </DialogFooter>
          </div>
        ) : isApproved && !isReapplying ? (
          /* STATUS: APPROVED */
          <div className="space-y-4 py-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="size-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {t("approvedTitle")}
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("approvedDesc")}
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full rounded-xl sm:w-auto"
              >
                {t("awesomeBtn")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* APPLICATION FORM (New or Re-apply) */
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-2"
            >
              {!isEmailVerified && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <span className="font-semibold">
                      {t("emailUnverifiedTitle", { email: userEmail || "" })}
                    </span>
                    <p className="text-muted-foreground mt-0.5">
                      {t("emailUnverifiedDesc")}
                    </p>
                  </div>
                </div>
              )}

              {isRejected && !isReapplying && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <XCircle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <span className="font-semibold">
                      {t("previousRejectedTitle")}
                    </span>
                    <p className="mt-0.5">
                      {application?.rejectionReason ||
                        t("defaultRejectionReason")}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      {t("reapplyHint")}
                    </p>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="stageName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      {t("stageNameLabel")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("stageNamePlaceholder")}
                        className="h-10 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      {t("bioLabel")}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("bioPlaceholder")}
                        className="min-h-24 rounded-xl text-sm"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-muted-foreground flex justify-between text-[11px]">
                      <span>{t("minChars")}</span>
                      <span>
                        {t("currentChars", {
                          count: String(field.value?.length || 0),
                        })}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-semibold">
                  {t("socialLinksLabel")}
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("facebookPlaceholder")}
                            className="h-9 rounded-xl text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("instagramPlaceholder")}
                            className="h-9 rounded-xl text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tiktokUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("tiktokPlaceholder")}
                            className="h-9 rounded-xl text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder={t("twitterPlaceholder")}
                            className="h-9 rounded-xl text-xs"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="portfolioUrls"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-muted-foreground text-xs font-semibold">
                      {t("portfolioLabel")}
                    </FormLabel>
                    <FormControl>
                      <TagChipsInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t("portfolioPlaceholder")}
                      />
                    </FormControl>
                    <p className="text-muted-foreground text-[11px]">
                      {t("portfolioHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="rounded-xl"
                >
                  {t("cancelBtn")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending || !isEmailVerified}
                  className="gap-2 rounded-xl text-xs font-semibold"
                >
                  {submitMutation.isPending && (
                    <Loader2 className="size-3.5 animate-spin" />
                  )}
                  <span>{t("submitBtn")}</span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
