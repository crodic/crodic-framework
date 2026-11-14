import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layouts/layout";
import { FeedView } from "@/components/feed/feed-view";

export const metadata: Metadata = {
  title: "Bảng tin Hoạt động (Feed) | CosSpace",
  description:
    "Cập nhật những hoạt động, tác phẩm và nhật ký mới nhất từ các cosplayer bạn đang theo dõi.",
};

export default function FeedPage() {
  return (
    <Layout>
      <FeedView />
    </Layout>
  );
}
