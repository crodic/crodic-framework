import "./globals.css";
import { dancingScript, geistMono, geistSans } from "@/fonts";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale || "vi"} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
