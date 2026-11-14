import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layouts/layout";
import { JobsView } from "@/components/jobs/jobs-view";

export const metadata: Metadata = {
  title: "Bản tin Booking & Tuyển dụng | CosSpace",
  description:
    "Kết nối thương hiệu, studio và cosplayer chuyên nghiệp. Bảng tin tuyển dụng mẫu ảnh, khách mời sự kiện và chế tác đạo cụ.",
};

export default function JobsPage() {
  return (
    <Layout>
      <JobsView />
    </Layout>
  );
}
