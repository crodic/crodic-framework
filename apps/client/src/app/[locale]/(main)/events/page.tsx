import React from "react";
import { Metadata } from "next";
import Layout from "@/components/layouts/layout";
import { EventsView } from "@/components/events/events-view";

export const metadata: Metadata = {
  title: "Sự kiện & Festival | Kosume",
  description:
    "Khám phá các sự kiện, lễ hội Anime & Cosplay hàng đầu tại Việt Nam. Đăng ký tham gia gian hàng, khách mời và giao lưu cùng cộng đồng.",
};

export default function EventsPage() {
  return (
    <Layout>
      <EventsView />
    </Layout>
  );
}
