import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCmsPageBySlug } from "@/services/cms-pages";
import Layout from "@/components/layouts/layout";

export const revalidate = 60; // Revalidate every 60 seconds

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getCmsPageBySlug(slug, locale);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    keywords: page.seoKeywords,
    alternates: {
      canonical: page.canonicalUrl,
    },
    robots: page.robots || "index, follow",
    openGraph: {
      title: page.ogTitle || page.seoTitle || page.title,
      description: page.ogDescription || page.seoDescription,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

export default async function CmsPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const page = await getCmsPageBySlug(slug, locale);

  if (!page) {
    notFound();
  }

  return (
    <Layout showRightRail={false}>
      {/* nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml */}
      <article
        aria-label={page.title}
        className="prose dark:prose-invert mx-auto w-full max-w-[72ch] min-w-0 px-4 py-8 [overflow-wrap:anywhere] sm:px-6 sm:py-12 [&_table]:block [&_table]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </Layout>
  );
}
