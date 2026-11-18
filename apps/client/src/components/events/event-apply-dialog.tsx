"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Ticket, Loader2 } from "lucide-react";
import type { EventSummaryResDto, EventDetailResDto } from "@/services/events";
import { useAuthStore } from "@/store/use-auth-store";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { applyEvent } from "@/services/events";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplyEventSchema, type ApplyEventFormValues } from "./schema";

export interface EventApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventSummaryResDto | EventDetailResDto | null;
}

export function EventApplyDialog({
  open,
  onOpenChange,
  event,
}: EventApplyDialogProps) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const router = useRouter();
  const t = useTranslations("Events");
  const tApply = useTranslations("Events.applyDialog");

  const applyEventSchema = useMemo(
    () => createApplyEventSchema(tApply),
    [tApply]
  );

  const form = useForm<ApplyEventFormValues>({
    resolver: zodResolver(applyEventSchema),
    defaultValues: {
      fullName: "",
      stageName: "",
      category: "guest",
      phone: "",
      characterPlanned: "",
      portfolioUrl: "",
      notes: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (values: ApplyEventFormValues) => {
      if (!event?.id) throw new Error("Event ID missing");
      return applyEvent(event.id, {
        roleType: values.category,
        stageName: values.stageName,
        contactInfo: values.phone,
        portfolioUrl: values.portfolioUrl,
        experience: values.characterPlanned,
        message: values.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      if (event?.id) {
        queryClient.invalidateQueries({ queryKey: ["event", event.id] });
      }
      toast.success(tApply("successTitle"), {
        description: tApply("successDesc"),
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(tApply("errorGeneric"));
    },
  });

  const handleOpenChange = (val: boolean) => {
    if (val) {
      if (isHydrating) return;
      if (!isAuthenticated) {
        toast.info(t("loginRequired"));
        router.push("/auth/login?from=/events");
        return;
      }
    }
    onOpenChange(val);
  };

  const onSubmit = (values: ApplyEventFormValues) => {
    if (isHydrating) return;
    if (!isAuthenticated) {
      toast.info(t("loginRequired"));
      router.push("/auth/login?from=/events");
      return;
    }
    applyMutation.mutate(values);
  };

  const isSubmitting = applyMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border/80 max-h-[92vh] max-w-[calc(100%-1rem)] overflow-y-auto rounded-2xl p-4 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <DialogHeader className="border-border/60 border-b pb-2">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Ticket className="size-3.5" />
            <span>{tApply("badge")}</span>
          </div>
          <DialogTitle className="text-foreground text-lg font-bold sm:text-xl">
            {event?.title
              ? `${tApply("title")} - ${event.title}`
              : tApply("title")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {tApply("desc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-3"
          >
            {/* Full Name & Stage Name */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("fullName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tApply("placeholderFullName")}
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("stageName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tApply("placeholderStageName")}
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Application Category & Contact Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("category")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 rounded-xl text-xs">
                          <SelectValue
                            placeholder={tApply("placeholderCategory")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="guest">
                          {tApply("categoryGuest")}
                        </SelectItem>
                        <SelectItem value="contest">
                          {tApply("categoryContest")}
                        </SelectItem>
                        <SelectItem value="artist">
                          {tApply("categoryArtist")}
                        </SelectItem>
                        <SelectItem value="workshop">
                          {tApply("categoryWorkshop")}
                        </SelectItem>
                        <SelectItem value="staff">
                          {tApply("categoryStaff")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      {tApply("phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tApply("placeholderPhone")}
                        className="h-9 rounded-xl text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Planned Character */}
            <FormField
              control={form.control}
              name="characterPlanned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("character")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tApply("placeholderCharacter")}
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Link Portfolio */}
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("portfolio")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={tApply("placeholderPortfolio")}
                      className="h-9 rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    {tApply("portfolioHelp")}
                  </FormDescription>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {tApply("notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder={tApply("placeholderNotes")}
                      className="resize-none rounded-xl text-xs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-9 cursor-pointer rounded-xl text-xs font-medium"
                disabled={isSubmitting}
              >
                {tApply("cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 cursor-pointer rounded-xl px-5 text-xs font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    {tApply("submitting")}
                  </>
                ) : (
                  tApply("submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
