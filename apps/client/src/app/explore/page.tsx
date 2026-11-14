import { redirect } from "next/navigation";

const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_APP_LOCALE || "en";

export default function ExploreRedirect() {
  redirect(`/${DEFAULT_LOCALE}/explore`);
}
