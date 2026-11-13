import { redirect } from "next/navigation";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_APP_LOCALE || "en";

export default function LandingRedirect() {
  redirect(`/${DEFAULT_LOCALE}/landing`);
}
