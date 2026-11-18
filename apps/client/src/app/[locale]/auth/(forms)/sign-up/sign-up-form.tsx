"use client";

import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import xior, { XiorError } from "xior";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { WhiteLabelLogo } from "@/lib/white-label";
import { createSignUpFormSchema, type SignUpFormValues } from "./schema";

export default function SignUpForm() {
  const t = useTranslations("Auth.signUp");

  const signUpFormSchema = useMemo(() => createSignUpFormSchema(t), [t]);

  const router = useRouter();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    try {
      await xior.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/auth/register`,
        {
          firstName: values.firstName,
          lastName: values.lastName || undefined,
          email: values.email,
          password: values.password,
        }
      );
      toast.success(t("successToast"));
      router.push("/auth/login?from=/onboarding&registered=true");
    } catch (error) {
      if (error instanceof XiorError) {
        toast.error(error.response?.data?.message || t("errorToast"));
      }
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex w-full flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 md:max-w-lg lg:px-4">
      {/* Mobile Brand Logo */}
      <div className="mb-6 flex justify-center lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2">
          <WhiteLabelLogo className="h-8 w-auto object-contain" />
        </Link>
      </div>

      <Card className="border-border/70 bg-card/90 w-full gap-6 rounded-2xl py-8 shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:py-10">
        <CardHeader className="space-y-2 px-6 sm:px-8">
          <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm leading-relaxed">
            {t("description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-4.5"
            >
              <div className="grid gap-3.5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("firstName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("firstNamePlaceholder")}
                          autoComplete="given-name"
                          disabled={isSubmitting}
                          className="h-10 sm:h-10.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {t("lastName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("lastNamePlaceholder")}
                          autoComplete="family-name"
                          disabled={isSubmitting}
                          className="h-10 sm:h-10.5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("password")}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      {t("confirmPassword")}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-10 sm:h-10.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="mt-2 h-10.5 w-full cursor-pointer gap-2 font-medium shadow-sm transition-all hover:shadow-md sm:h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <span>{t("submit")}</span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center px-6 pt-2 sm:px-8 sm:pt-3">
          <p className="text-muted-foreground text-center text-xs sm:text-sm">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
