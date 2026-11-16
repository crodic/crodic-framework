import React from "react";
import Layout from "@/components/layouts/layout";
import { CreateAlbumModal } from "@/components/studio/create-album-modal";
import { SortableImageUpload } from "@/components/form/sortable-image-upload";
import { CreateAlbumForm } from "@/components/studio/create-album-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tải lên Album mới | Kosume Studio",
  description: "Xuất bản và quản lý bộ ảnh cosplay nghệ thuật",
};

export default function StudioUploadPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Tải lên Album mới (Studio Upload Flow)
          </h1>
          <p className="text-muted-foreground text-sm">
            Kéo thả sắp xếp hình ảnh và điền thông tin tác phẩm để xuất bản
          </p>
        </div>

        {/* Studio Upload Frame matching mockup */}
        <div className="bg-card border-border/80 flex flex-col overflow-hidden rounded-2xl border shadow-xl md:flex-row">
          {/* Left Column: Sortable Image Grid */}
          <div className="border-border/60 flex flex-1 flex-col border-r p-6 md:w-[58%]">
            <SortableImageUpload
              variant="studio"
              showInlineAddSlot={true}
              existingImages={[]}
              maxFiles={20}
              gridClassName="grid-cols-2 sm:grid-cols-3 gap-3"
            />
          </div>

          {/* Right Column: Studio Form */}
          <div className="bg-card/60 p-6 md:w-[42%]">
            <div className="border-border/60 mb-5 border-b pb-3">
              <h2 className="text-foreground text-base font-bold">
                Thông tin Album
              </h2>
              <p className="text-muted-foreground text-xs">
                Sử dụng shadcn Form component và Zod validation
              </p>
            </div>

            <CreateAlbumForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
