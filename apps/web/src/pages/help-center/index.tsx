import { useMemo, useState } from 'react'
import {
  ArrowRightIcon,
  BookMarkedIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CommandIcon,
  FileTextIcon,
  FolderSearchIcon,
  GitBranchIcon,
  GitMergeIcon,
  HelpCircleIcon,
  KeyRoundIcon,
  LayersIcon,
  LifeBuoyIcon,
  PaletteIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TerminalIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { useBreadcrumb } from '@/hooks/use-breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'

type HelpCategory = 'all' | 'tags' | 'files' | 'security' | 'cms' | 'audit'

interface FeatureModule {
  id: string
  category: HelpCategory
  titleVi: string
  titleEn: string
  descVi: string
  descEn: string
  icon: React.ComponentType<{ className?: string }>
  badgeVi: string
  badgeEn: string
  accent: string
  link: string
  bulletsVi: string[]
  bulletsEn: string[]
}

interface WorkflowItem {
  id: string
  titleVi: string
  titleEn: string
  stepsVi: string[]
  stepsEn: string[]
  tagVi: string
  tagEn: string
}

interface FaqItem {
  id: string
  category: HelpCategory
  questionVi: string
  questionEn: string
  answerVi: string
  answerEn: string
  link?: string
  linkTextVi?: string
  linkTextEn?: string
}

const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'tags-dag',
    category: 'tags',
    titleVi: 'Cây Phân Cấp Ngữ Nghĩa & Đồ Thị DAG',
    titleEn: 'Semantic Tag Hierarchy & DAG Graph',
    descVi:
      'Mô hình hóa quan hệ cha - con (Is-A / Inheritance), thẻ con chuyên biệt (Sub-types), thẻ liên quan (Related) và phân biệt đồng âm (Disambiguation). Hệ thống tự động phát hiện và chặn quan hệ vòng lặp chu trình, đồng thời tính toán bảng chuyển tiếp closure table phục vụ truy vấn tối ưu.',
    descEn:
      'Model parent-child inheritance (Is-A), sub-types specialization, peer associative links, and disambiguation. Automatically detects and blocks cyclic graph loops while updating transitive closure tables for instant search expansion.',
    icon: GitBranchIcon,
    badgeVi: 'Taxonomy DAG',
    badgeEn: 'Taxonomy DAG',
    accent: 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20',
    link: '/tags',
    bulletsVi: [
      'Liên kết phân cấp đa tầng (Parent, Child, Related, Disambiguation)',
      'Phát hiện vòng lặp chu trình (Cycle Detection) bảo toàn đồ thị DAG',
      'Định danh chuẩn Unicode NFKC, phân loại 6 nhóm ngữ nghĩa',
      'Đồng bộ từ đồng nghĩa (Aliases / 表記揺れ) và bản dịch đa ngôn ngữ',
    ],
    bulletsEn: [
      'Multi-tier semantic linking (Parent, Child, Related, Disambiguation)',
      'Real-time cyclic loop prevention preserving DAG integrity',
      'Unicode NFKC canonical identity with 6 semantic categories',
      'Orthographic alias mapping and localized multilingual translations',
    ],
  },
  {
    id: 'tag-encyclopedia',
    category: 'tags',
    titleVi: 'Bách Khoa Toàn Thư & Lịch Sử Phiên Bản',
    titleEn: 'Tag Wiki Encyclopedia & Version Rollbacks',
    descVi:
      'Studio biên tập bài viết wiki đa ngôn ngữ (Tiếng Việt, English, 日本語) với Tiptap Editor, tóm tắt hiển thị hover card, ảnh bìa tích hợp Media Library. Mỗi lần lưu ghi nhận một snapshot bất biến cho phép khôi phục phiên bản (Rollback) và cờ khóa chỉnh sửa từ cộng đồng.',
    descEn:
      'Multilingual encyclopedia studio (Vietnamese, English, Japanese) powered by Tiptap Editor, hover card summaries, and Media Library header images. Every edit records an immutable snapshot supporting one-click rollbacks and community edit locks.',
    icon: BookMarkedIcon,
    badgeVi: 'Wiki & Snapshots',
    badgeEn: 'Wiki & Snapshots',
    accent:
      'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    link: '/tag-encyclopedias',
    bulletsVi: [
      'Trình biên tập Rich-text Tiptap WYSIWYG chuyên sâu',
      'Ảnh bìa đại diện tiêu chuẩn (Header image) tích hợp Media Library',
      'Ngăn kéo lịch sử phiên bản bất biến (Audit snapshots)',
      'Khôi phục phiên bản cũ (Rollback) & Khóa chỉnh sửa Quản trị viên',
    ],
    bulletsEn: [
      'Full-featured Tiptap WYSIWYG rich-text authoring',
      'Media Library integrated header cover images',
      'Slide-out drawer with immutable revision audit snapshots',
      'One-click revision rollback and admin-only edit locking',
    ],
  },
  {
    id: 'tag-merge',
    category: 'tags',
    titleVi: 'Hợp Nhất Thẻ Nguyên Tử & Chuyển Hướng SEO 301',
    titleEn: 'Atomic Tag Merge & SEO 301 Redirects',
    descVi:
      'Xử lý triệt để tình trạng phân mảnh và trùng lặp thẻ. Di chuyển nguyên tử toàn bộ liên kết tác phẩm, bài viết, alias và các cạnh quan hệ DAG từ thẻ nguồn sang thẻ đích trong một transaction duy nhất. Thẻ nguồn tự động trở thành alias chuyển hướng SEO 301.',
    descEn:
      'Resolve tag fragmentation and duplicates atomically. Reassign all entity artworks, articles, aliases, and DAG relation edges from the source tag to the destination tag in a single transaction, permanently redirecting traffic via 301 alias.',
    icon: GitMergeIcon,
    badgeVi: 'Atomic Merge',
    badgeEn: 'Atomic Merge',
    accent:
      'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    link: '/tags',
    bulletsVi: [
      'Bảng xem trước tác động (Impact Preview) kiểm toán số lượng',
      'Chuyển giao toàn bộ tác phẩm gắn thẻ sang thẻ chuẩn đích',
      'Thẻ nguồn chuyển thành từ đồng nghĩa alias và lưu trữ vĩnh viễn',
      'Bảo vệ cờ Hệ thống (isSystem) không bị gộp hoặc xóa trái phép',
    ],
    bulletsEn: [
      'Atomic impact preview estimating entity and DAG migrations',
      'Full reallocation of tagged entities to the target canonical tag',
      'Source tag automatically archived and converted to 301 alias',
      'Built-in system tag protection preventing unauthorized mergers',
    ],
  },
  {
    id: 'files-media',
    category: 'files',
    titleVi: 'Thư Viện Media & Quản Trị Tệp Đa Ổ Đĩa',
    titleEn: 'Media Library & Multi-Disk File Storage',
    descVi:
      'Quản lý tài nguyên tệp tin tập trung với kiến trúc đa ổ đĩa (Local storage, Public S3, Private secure bucket). Cung cấp bộ chọn tệp FilePickerDialog tái sử dụng trong form tạo tag, bài viết CMS và hồ sơ, hỗ trợ xem trước ảnh, video, âm thanh và tài liệu.',
    descEn:
      'Centralized file management architecture supporting multi-disk drivers (Local, Public S3, Private secure storage). Powers the reusable FilePickerDialog across tag editors, CMS forms, and profiles with native previews.',
    icon: FolderSearchIcon,
    badgeVi: 'Multi-Disk Storage',
    badgeEn: 'Multi-Disk Storage',
    accent:
      'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    link: '/files',
    bulletsVi: [
      'Hỗ trợ đa ổ lưu trữ: Local Disk, Cloud S3 Public & S3 Private',
      'Hộp thoại chọn tệp (FilePickerDialog) tích hợp toàn hệ thống',
      'Trình phát media trực tiếp cho ảnh, video, âm thanh và file PDF',
      'Kiểm soát dung lượng tối đa và danh sách định dạng MIME an toàn',
    ],
    bulletsEn: [
      'Multi-storage disk drivers: Local, Cloud S3 Public & Private',
      'Reusable FilePickerDialog integrated into all operational forms',
      'Native in-browser media players for images, video, audio, and PDF',
      'MIME-type enforcement and configurable upload payload limits',
    ],
  },
  {
    id: 'security-roles',
    category: 'security',
    titleVi: 'Ma Trận Phân Quyền (RBAC) & Quản Trị Nhân Sự',
    titleEn: 'RBAC Permission Matrix & Access Control',
    descVi:
      'Phân quyền kiểm soát truy cập theo vai trò (RBAC). Ma trận phân quyền chi tiết theo từng đối tượng thực thể (ADMIN, USER, ROLE, TAG, PAGE, FILE, v.v.) và hành động (create, read, update, delete). Phân tách rõ Quản trị viên nội bộ và Người dùng thành viên.',
    descEn:
      'Granular Role-Based Access Control (RBAC). Fine-grained permission matrix mapped across subjects (ADMIN, USER, ROLE, TAG, PAGE, FILE, etc.) and actions (create, read, update, delete). Clearly differentiates internal staff from community users.',
    icon: ShieldCheckIcon,
    badgeVi: 'RBAC Security',
    badgeEn: 'RBAC Security',
    accent:
      'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    link: '/roles',
    bulletsVi: [
      'Ma trận phân quyền trực quan theo từng phân hệ nghiệp vụ',
      'Phân định Quản trị viên (/admins) và Người dùng (/users)',
      'Bảo vệ route trang và ẩn nút hành động không có quyền truy cập',
      'Bảo mật tài khoản với Xác thực 2 bước (2FA Google Authenticator)',
    ],
    bulletsEn: [
      'Visual permission matrix categorized by operational domains',
      'Clear segregation of Admins (/admins) and Community Users (/users)',
      'Route guards and conditional UI action buttons based on capabilities',
      'Elevated account security with Two-Factor Authentication (2FA TOTP)',
    ],
  },
  {
    id: 'cms-pages',
    category: 'cms',
    titleVi: 'Soạn Thảo Trang Tĩnh & Xuất Bản Nội Dung CMS',
    titleEn: 'CMS Pages & Content Publishing Studio',
    descVi:
      'Quản lý và xuất bản các trang nội dung tĩnh, trang điều khoản, chính sách bảo mật, giới thiệu dự án. Trình soạn thảo trực quan Tiptap hỗ trợ định dạng bảng, khối trích dẫn, chèn media từ thư viện và cấu hình slug URL thân thiện với công cụ tìm kiếm.',
    descEn:
      'Publish static portal pages, terms of service, privacy policies, and about sections. Rich-text Tiptap editor supports structured formatting, media embedding from library, custom slugs, and SEO Open Graph meta tags.',
    icon: FileTextIcon,
    badgeVi: 'CMS Studio',
    badgeEn: 'CMS Studio',
    accent:
      'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    link: '/cms-pages',
    bulletsVi: [
      'Biên tập trực quan với công cụ định dạng phong phú Tiptap',
      'Chèn ảnh trực tiếp từ Media Library tối ưu tài nguyên lưu trữ',
      'Cấu hình URL slug chuẩn SEO và thẻ Open Graph mạng xã hội',
      'Quản lý trạng thái xuất bản linh hoạt (Bản nháp / Hoạt động)',
    ],
    bulletsEn: [
      'Intuitive visual authoring with rich Tiptap formatting controls',
      'Direct Media Library asset insertion preventing redundant uploads',
      'SEO-friendly custom URL slugging and Open Graph social tags',
      'Flexible draft and publication lifecycle status controls',
    ],
  },
  {
    id: 'white-label',
    category: 'cms',
    titleVi: 'Tùy Biến Thương Hiệu (White-Label) & Giao Diện',
    titleEn: 'White-Label Branding & Theme Customization',
    descVi:
      'Cá nhân hóa giao diện cổng thông tin theo nhận diện thương hiệu của từng tổ chức: Tên thương hiệu, Logo sáng/tối, Favicon, Bảng màu chủ đạo (Primary color), và các liên kết hỗ trợ người dùng. Tích hợp chuyển đổi nhanh Dark/Light và chuyển đổi ngôn ngữ.',
    descEn:
      'Personalize portal aesthetics to match your brand identity: brand name, light/dark logos, favicon, primary color schemes, and user support links. Seamlessly integrates with system dark/light switching and multilingual locale toggle.',
    icon: PaletteIcon,
    badgeVi: 'Theme & Brand',
    badgeEn: 'Theme & Brand',
    accent:
      'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
    link: '/white-labels',
    bulletsVi: [
      'Tải lên logo và favicon riêng biệt cho từng thương hiệu',
      'Tùy biến bảng màu giao diện và tokens màu sắc động',
      'Hỗ trợ chế độ Sáng / Tối (Dark / Light mode) chuẩn WCAG',
      'Bộ chuyển đổi ngôn ngữ Tiếng Việt / English toàn hệ thống',
    ],
    bulletsEn: [
      'Custom logo and favicon uploads tailored per brand identity',
      'Dynamic CSS theme tokens and primary color customization',
      'WCAG-compliant high-contrast Dark and Light color themes',
      'Instant global language switching between Vietnamese and English',
    ],
  },
  {
    id: 'audit-logs',
    category: 'audit',
    titleVi: 'Nhật Ký Hoạt Động & Dấu Vết Kiểm Toán',
    titleEn: 'Audit Trail & Activity Monitoring Logs',
    descVi:
      'Giám sát và ghi nhận toàn bộ hoạt động trong hệ thống: gắn/gỡ thẻ của cộng đồng, thay đổi cấu hình thẻ của quản trị viên, thao tác phân quyền, đăng nhập và nhật ký email gửi đi. Đảm bảo tính minh bạch và truy cứu trách nhiệm khi có sự cố.',
    descEn:
      'Track and audit all administrative and community operations: folksonomy tag attachments, canonical modifications, permission changes, logins, and outgoing email logs. Provides complete forensic accountability.',
    icon: LayersIcon,
    badgeVi: 'Audit Trail',
    badgeEn: 'Audit Trail',
    accent:
      'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    link: '/logs',
    bulletsVi: [
      'Nhật ký thao tác chi tiết: Hành động, thực thể đích, người thực hiện, thời gian',
      'Ghi nhận ảnh chụp thay đổi (Snapshot diff: Thẻ cũ -> Thẻ mới)',
      'Nhật ký gửi email (Email Logs) kiểm tra trạng thái chuyển phát mail',
      'Bộ lọc tìm kiếm mạnh mẽ theo hành động, loại thực thể và ID',
    ],
    bulletsEn: [
      'Granular audit records: Action, target entity, actor name, timestamp',
      'Visual diff snapshots of modifications (e.g., Old Tag -> New Tag)',
      'Dedicated Email Logs tracking delivery outcomes and SMTP status',
      'Multi-parameter filtering by action type, entity type, and ID',
    ],
  },
]

const WORKFLOWS: WorkflowItem[] = [
  {
    id: 'wf-create-tag',
    tagVi: 'Quản trị Thẻ',
    tagEn: 'Tag Taxonomy',
    titleVi: 'Quy trình Thiết lập Cây Phân Cấp (DAG) & Bách Khoa cho Thẻ Mới',
    titleEn: 'Setting Up DAG Hierarchy & Encyclopedia for a New Tag',
    stepsVi: [
      'Đăng ký Thẻ Chuẩn: Vào /tags/create nhập tên định danh chuẩn (#Name), chọn 1 trong 6 nhóm ngữ nghĩa (General, Copyright, Character, v.v.) và mức an toàn.',
      'Bổ sung Tên hiển thị & Từ đồng nghĩa (Alias): Nhập bản dịch đa ngôn ngữ và thêm các từ viết tắt, phiên âm hoặc lỗi chính tả (VD: "FGO", "Saber") để tìm kiếm tự động nhận diện.',
      'Thiết lập Quan hệ Đồ thị DAG: Mở tab Cây Phân Cấp Ngữ Nghĩa (DAG). Bấm nút thiết lập quan hệ để liên kết Thẻ Cha bao quát (Is-A), Thẻ Con cụ thể (Sub-types), Thẻ Ngang Hàng và Thẻ Đồng Âm.',
      'Biên tập & Xuất bản Bài viết Wiki: Chuyển sang tab Từ điển Wiki (dic), viết đoạn tóm tắt mở đầu, bài viết bách khoa chi tiết và chọn ảnh bìa tiêu chuẩn từ Media Library trước khi Lưu & Xuất bản.',
    ],
    stepsEn: [
      'Register Canonical Tag: Visit /tags/create, enter the canonical name (#Name), select 1 of 6 semantic categories (General, Copyright, Character, etc.), and set the safety rating.',
      'Add Display Names & Aliases: Provide multilingual translations and register acronyms, romanizations, or orthographic variants (e.g. "FGO", "Saber") for smart autocomplete resolution.',
      'Configure Semantic DAG Graph: Open the DAG Hierarchy tab. Click "Set Up Tag Relations" to link broader Parent tags (Is-A), narrower Child tags (Sub-types), Related tags, and Disambiguations.',
      'Author & Publish Wiki Article: Switch to the Wiki Encyclopedia tab, craft a concise lead summary, write overview lore, and attach a header cover image from Media Library before publishing.',
    ],
  },
  {
    id: 'wf-merge-tag',
    tagVi: 'Hợp nhất Dữ liệu',
    tagEn: 'Data Merging',
    titleVi: 'Quy trình Hợp Nhất 2 Thẻ Trùng Lặp & Tự Động Chuyển Hướng 301',
    titleEn: 'Merging Duplicate Tags & Configuring 301 SEO Redirects',
    stepsVi: [
      'Xác định Thẻ Nguồn cần gộp: Vào danh mục /tags, bấm nút hành động của thẻ nguồn bị trùng lặp và chọn "Gộp vào thẻ khác...".',
      'Tìm kiếm Thẻ Chuẩn Đích: Gõ tên thẻ chuẩn đích trong hộp thoại tìm kiếm và chọn thẻ chính xác.',
      'Kiểm tra Bảng Tác động Nguyên tử (Impact Preview): Xem trước số lượng tác phẩm sẽ được chuyển sang thẻ đích, số biến thể alias được kế thừa và số cạnh DAG được đấu nối lại.',
      'Xác nhận Hợp nhất: Bấm "Xác nhận Gộp Thẻ" để hoàn tất giao dịch. Thẻ nguồn sẽ tự động lưu trữ và trở thành từ đồng nghĩa chuyển hướng 301 SEO vĩnh viễn sang thẻ đích.',
    ],
    stepsEn: [
      'Identify Source Duplicate Tag: Under /tags, open the row action menu for the duplicate source tag and select "Merge Into Tag...".',
      'Search Target Canonical Tag: Type the destination canonical name in the modal search bar and select the target node.',
      'Review Atomic Impact Preview: Inspect exact counts of affected entity tags, transferred aliases, and rewired DAG hierarchy relationships.',
      'Confirm Atomic Merge: Click "Confirm Merge" to execute the transaction. The source tag is safely archived and converted into a permanent 301 SEO alias redirect.',
    ],
  },
  {
    id: 'wf-onboard-admin',
    tagVi: 'Phân quyền & Bảo mật',
    tagEn: 'Security & Access',
    titleVi: 'Quy trình Phân Quyền & Cấp Tài Khoản Quản Trị Viên Mới',
    titleEn: 'Assigning Role Permissions & Onboarding New Admins',
    stepsVi: [
      'Cấu hình Vai trò & Ma trận Quyền: Vào /roles/create để tạo vai trò mới (hoặc chỉnh sửa vai trò hiện có tại /roles), tích chọn các quyền hạn cụ thể trong Ma trận phân quyền.',
      'Tạo Tài khoản Quản trị viên: Truy cập /admins/create, nhập email, họ tên, mật khẩu khởi tạo và gán vai trò vừa tạo cho nhân sự.',
      'Kích hoạt Bảo mật 2 Bước (2FA): Hướng dẫn nhân sự đăng nhập và truy cập ngay /settings/security để quét mã QR Google Authenticator và bật xác thực hai yếu tố.',
      'Kiểm tra Phân quyền Hoạt động: Quản trị viên có thể kiểm tra lịch sử thao tác của nhân sự mới tại /logs.',
    ],
    stepsEn: [
      'Configure Roles & Permissions: Navigate to /roles/create to define a role, checking off specific permissions across subjects in the Permission Matrix.',
      'Create Administrator Account: Open /admins/create, supply staff credentials, initial credentials, and assign the created operational role.',
      'Enforce Two-Factor Authentication (2FA): Instruct the staff member to sign in and immediately visit /settings/security to pair Google Authenticator TOTP.',
      'Monitor Operational Audit Trail: Lead administrators can verify login activity and permission checks anytime in /logs.',
    ],
  },
  {
    id: 'wf-media-cms',
    tagVi: 'Media & Nội dung',
    tagEn: 'Media & CMS',
    titleVi: 'Quy trình Tải Lên Tệp Tin Media & Tái Sử Dụng Trên Toàn Portal',
    titleEn: 'Uploading Media Assets & Reusing Across the Portal',
    stepsVi: [
      'Tải tệp lên Thư viện Media: Truy cập /files, bấm "Tải lên tệp" để tải hình ảnh, video, âm thanh hoặc tài liệu vào ổ đĩa thích hợp (Local hoặc Cloud S3).',
      'Tái sử dụng qua File Picker Dialog: Khi soạn thảo bài viết CMS (/cms-pages), ảnh bìa bách khoa hoặc avatar, bấm nút "Duyệt thư viện" để mở FilePickerDialog.',
      'Chọn tệp tin đã tối ưu: Bấm chọn tệp từ danh sách để chèn ngay lập tức với URL tối ưu mà không phải tải lên trùng lặp gây tốn dung lượng máy chủ.',
      'Xem trước và Quản lý: Có thể xem trước ảnh độ phân giải đầy đủ, phát video/audio trực tiếp hoặc sao chép URL công khai bất kỳ lúc nào.',
    ],
    stepsEn: [
      'Upload Assets to Media Library: Visit /files, click "Upload file" to store images, video, audio, or documents to the appropriate disk driver (Local or Cloud S3).',
      'Reuse with File Picker Dialog: When authoring CMS pages (/cms-pages), encyclopedia covers, or user avatars, click "Browse Library" to summon the FilePickerDialog.',
      'Insert Deduplicated Asset: Pick the existing file to link its URL immediately, preventing redundant upload storage costs.',
      'Preview & Share: View full-resolution images, stream media directly in-portal, or copy permanent public asset URLs anytime.',
    ],
  },
]

const FAQS: FaqItem[] = [
  {
    id: 'faq-system-tag',
    category: 'tags',
    questionVi:
      'Tại sao tôi không thể xóa hoặc gộp một thẻ nhất định trong danh sách?',
    questionEn: 'Why can’t I delete or merge a specific tag in the directory?',
    answerVi:
      'Thẻ đó đang được bảo vệ bởi cờ "Thẻ Hệ thống" (isSystem = true), ví dụ như #AI-Generated, #Original, #Exclusive. Đây là các thẻ cốt lõi của nền tảng được bảo vệ cấp hệ thống nhằm ngăn ngừa việc người dùng hoặc quản trị viên vô tình làm đứt gãy cấu trúc phân loại. Nếu thực sự cần chỉnh sửa hoặc gỡ bỏ, Quản trị viên có quyền Root phải vào trang Chỉnh sửa Thẻ (/tags/:id/edit) để tắt cờ "Tag Hệ thống" trước.',
    answerEn:
      'That tag is protected by the "System Tag" flag (isSystem = true), such as #AI-Generated or #Original. These are core platform taxonomy tags protected at the platform level to prevent accidental deletion or data corruption. To modify or delete such a tag, a Root Administrator must first edit the tag at /tags/:id/edit and uncheck the "System Tag" switch before proceeding.',
    link: '/tags',
    linkTextVi: 'Xem danh sách Thẻ',
    linkTextEn: 'View Tags Directory',
  },
  {
    id: 'faq-rollback-wiki',
    category: 'tags',
    questionVi:
      'Làm cách nào để khôi phục bài viết Bách khoa toàn thư (Wiki) khi bị sửa nhầm?',
    questionEn:
      'How do I roll back an encyclopedia article to a previous revision?',
    answerVi:
      'Hệ thống Bách khoa toàn thư lưu trữ toàn bộ lịch sử sửa đổi dưới dạng các bản snapshot bất biến. Bạn hãy truy cập vào trang chi tiết thẻ (/tags/:id/show?tab=encyclopedia), bấm vào nút "Lịch sử Phiên bản (Revisions)" ở góc trên bên phải để mở ngăn kéo lịch sử. Duyệt đến phiên bản bạn muốn quay lại, xem ghi chú thay đổi và bấm "Khôi phục". Thao tác này sẽ tự động xuất bản một phiên bản mới giữ nguyên nội dung cũ mà không làm mất lịch sử kiểm toán.',
    answerEn:
      'The Encyclopedia studio records every save as an immutable revision snapshot. Navigate to the tag show page at /tags/:id/show?tab=encyclopedia, click the "Revision History" button on the top right to open the history drawer. Locate the revision you want to restore, review its change note, and click "Rollback". This safely publishes a new revision reflecting the previous state while preserving full audit history.',
    link: '/tag-encyclopedias',
    linkTextVi: 'Mở Bách khoa toàn thư',
    linkTextEn: 'Open Tag Encyclopedia',
  },
  {
    id: 'faq-dag-cycle',
    category: 'tags',
    questionVi:
      'Thuật toán phát hiện vòng lặp (Cycle Detection) của Cây phân cấp DAG hoạt động thế nào?',
    questionEn: 'How does DAG cycle detection prevent infinite loops?',
    answerVi:
      'Đồ thị phân loại thẻ của hệ thống được xây dựng dưới dạng Đồ thị có hướng không chu trình (Directed Acyclic Graph - DAG). Khi bạn liên kết quan hệ cha/con, hệ thống sẽ tự động truy vấn bảng chuyển tiếp (closure table) để kiểm tra xem thẻ được chọn có thuộc tập tổ tiên hoặc hậu duệ của node hiện tại hay không. Nếu phát hiện liên kết sẽ tạo thành chu trình khép kín (ví dụ: A là cha B, B là cha C, và cố gắng đặt C là cha A), hệ thống sẽ lập tức chặn lại và hiển thị cảnh báo để bảo đảm đồ thị không bao giờ bị lặp vô tận.',
    answerEn:
      'The tag taxonomy is architected as a strict Directed Acyclic Graph (DAG). Whenever a parent or child relation is linked, the API queries the transitive closure table to check if the target tag belongs to the ancestral or descendant path of the current node. If an edge would create a closed loop (e.g. A → B → C → A), the action is rejected immediately with an explicit error to preserve DAG consistency.',
  },
  {
    id: 'faq-roles-refresh',
    category: 'security',
    questionVi:
      'Tôi vừa thay đổi quyền hạn trong Vai trò (Role) nhưng Quản trị viên chưa thấy tác dụng ngay?',
    questionEn:
      'Why haven’t recently updated role permissions taken effect yet?',
    answerVi:
      'Cơ chế xác thực của cổng thông tin sử dụng mã thông báo JSON Web Token (JWT) được ký bảo mật tại thời điểm đăng nhập chứa danh sách quyền hạn. Để nhận quyền hạn mới nhất từ cơ sở dữ liệu, người dùng chỉ cần Đăng xuất và Đăng nhập lại (hoặc đợi cơ chế làm mới token tự động sau khi token hết hạn). Sau khi đăng nhập lại, toàn bộ quyền hạn mới sẽ được cập nhật ngay lập tức trên thanh điều hướng và các trang nghiệp vụ.',
    answerEn:
      'Portal authorization uses JSON Web Tokens (JWT) minted at login time containing the user’s active permissions. For updated role permissions to take immediate effect, the administrator simply needs to Sign Out and Sign Back In (or wait for the automatic token refresh cycle). Once re-authenticated, all updated permissions will reflect instantly across navigation menus and route guards.',
    link: '/roles',
    linkTextVi: 'Xem Danh sách Vai trò',
    linkTextEn: 'View Roles List',
  },
  {
    id: 'faq-command-menu',
    category: 'cms',
    questionVi:
      'Làm cách nào để chuyển đổi ngôn ngữ hoặc tìm nhanh bất kỳ trang nào trong hệ thống?',
    questionEn:
      'How can I quickly switch languages or find any page across the portal?',
    answerVi:
      'Hệ thống cung cấp 2 phương thức tiện lợi: (1) Nhấp vào biểu tượng cờ quốc gia (VN/US) ở thanh Header trên cùng để chuyển đổi ngôn ngữ tức thì; (2) Nhấn tổ hợp phím ⌘K (macOS) hoặc Ctrl+K (Windows/Linux) để mở Menu lệnh thông minh (Command Menu). Menu lệnh cho phép bạn gõ tìm kiếm bất kỳ trang nào, thay đổi giao diện Sáng/Tối hoặc đổi ngôn ngữ mà không cần dùng chuột.',
    answerEn:
      'Two quick methods are available: (1) Click the flag indicator icon (US/VN) on the top header to instantly switch between English and Vietnamese; (2) Press ⌘K (macOS) or Ctrl+K (Windows/Linux) to trigger the universal Command Menu. The Command Menu allows typing to navigate to any portal screen, toggle theme modes, or switch languages with zero mouse friction.',
  },
  {
    id: 'faq-upload-troubleshoot',
    category: 'files',
    questionVi:
      'Gặp lỗi khi tải lên tệp tin Media (Upload Failed) thì cần kiểm tra những gì?',
    questionEn: 'What should I check if a file upload fails?',
    answerVi:
      'Vui lòng kiểm tra 3 điểm kỹ thuật: (1) Dung lượng tệp tin có vượt quá giới hạn tải lên tối đa được cấu hình trong hệ thống hay không; (2) Định dạng tệp tin có nằm trong danh sách MIME types an toàn được cho phép (hình ảnh, video mp4/webm, audio mp3/wav, tài liệu pdf/docx); (3) Kiểm tra kết nối cấu hình ổ đĩa Cloud S3/R2 trong trường hợp đang dùng ổ lưu trữ đám mây. Bạn có thể tra cứu chi tiết thông báo lỗi tại trang Nhật ký hoạt động (/logs).',
    answerEn:
      'Check three common configuration parameters: (1) Verify whether the file size exceeds the configured max upload limit; (2) Ensure the file MIME type is permitted (common images, mp4/webm video, mp3/wav audio, pdf/docx documents); (3) If using Cloud S3/R2, verify network credentials and bucket connectivity. Detailed error payloads can be inspected under Activity Logs at /logs.',
    link: '/files',
    linkTextVi: 'Kiểm tra Quản trị Tệp',
    linkTextEn: 'Check File Manager',
  },
]

const DIAGNOSTIC_CHECKS = [
  {
    id: 1,
    titleVi:
      'Kiểm tra cờ Bảo vệ Hệ thống (isSystem) khi gặp lỗi không thể xóa hoặc gộp thẻ',
    titleEn:
      'Verify isSystem protection flag when encountering tag deletion or merge restrictions',
  },
  {
    id: 2,
    titleVi:
      'Đăng xuất và đăng nhập lại để cập nhật mã quyền hạn mới trong Token JWT',
    titleEn:
      'Sign out and sign back in to refresh updated RBAC claims inside the JWT token',
  },
  {
    id: 3,
    titleVi:
      'Tra cứu chi tiết mã lỗi và dấu vết kiểm toán tại Nhật ký Hoạt động (/logs)',
    titleEn:
      'Inspect comprehensive error payloads and audit traces in Activity Logs (/logs)',
  },
  {
    id: 4,
    titleVi:
      'Kiểm tra định dạng MIME type và giới hạn dung lượng tải lên trong Media Library',
    titleEn:
      'Confirm MIME type allowances and maximum file size limits in Media Library',
  },
]

export function PageHelpCenter() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setOpen: setCommandMenuOpen } = useSearch()

  const isVi = (i18n.language || 'vi').toLowerCase().startsWith('vi')

  useBreadcrumb([
    { title: t('helpCenter.title', 'Trung tâm Trợ giúp & Hướng dẫn Quản trị') },
  ])

  // Interactive States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all')
  const [checkedDiagnostics, setCheckedDiagnostics] = useState<
    Record<number, boolean>
  >({})
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    'faq-system-tag': true,
  })

  const toggleDiagnostic = (id: number) => {
    setCheckedDiagnostics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Filter Modules by Category and Search Query
  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return FEATURE_MODULES.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory
      if (!matchCategory) return false

      if (!q) return true

      const title = (isVi ? item.titleVi : item.titleEn).toLowerCase()
      const desc = (isVi ? item.descVi : item.descEn).toLowerCase()
      const bullets = (isVi ? item.bulletsVi : item.bulletsEn)
        .join(' ')
        .toLowerCase()

      return title.includes(q) || desc.includes(q) || bullets.includes(q)
    })
  }, [searchQuery, selectedCategory, isVi])

  // Filter Workflows by Search Query
  const filteredWorkflows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return WORKFLOWS

    return WORKFLOWS.filter((wf) => {
      const title = (isVi ? wf.titleVi : wf.titleEn).toLowerCase()
      const steps = (isVi ? wf.stepsVi : wf.stepsEn).join(' ').toLowerCase()
      return title.includes(q) || steps.includes(q)
    })
  }, [searchQuery, isVi])

  // Filter FAQs by Category and Search Query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return FAQS.filter((faq) => {
      const matchCategory =
        selectedCategory === 'all' || faq.category === selectedCategory
      if (!matchCategory) return false

      if (!q) return true

      const question = (isVi ? faq.questionVi : faq.questionEn).toLowerCase()
      const answer = (isVi ? faq.answerVi : faq.answerEn).toLowerCase()
      return question.includes(q) || answer.includes(q)
    })
  }, [searchQuery, selectedCategory, isVi])

  const totalResults =
    filteredModules.length + filteredWorkflows.length + filteredFaqs.length
  const allDiagnosticsCompleted = DIAGNOSTIC_CHECKS.every(
    (item) => checkedDiagnostics[item.id]
  )

  return (
    <Main className='space-y-8'>
      {/* Executive Hero Banner & Interactive Search */}
      <section className='border-border/80 bg-card relative overflow-hidden rounded-2xl border p-6 shadow-2xs backdrop-blur-xs sm:p-8'>
        <div className='bg-primary/5 pointer-events-none absolute top-0 right-0 h-64 w-64 translate-x-12 -translate-y-12 rounded-full blur-3xl' />

        <div className='flex flex-wrap items-center justify-between gap-3 pb-4'>
          <Badge
            variant='secondary'
            className='gap-1.5 px-3 py-1 text-xs font-semibold shadow-2xs'
          >
            <SparklesIcon
              className='text-primary size-3.5'
              aria-hidden='true'
            />
            {t('helpCenter.badge', 'Cẩm nang Vận hành Hệ thống')}
          </Badge>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setCommandMenuOpen(true)}
            className='h-8 cursor-pointer gap-2 font-mono text-xs shadow-2xs'
          >
            <CommandIcon className='text-primary size-3.5' aria-hidden='true' />
            <span>
              {t('helpCenter.triggerCommandMenu', 'Mở Menu Lệnh (⌘K)')}
            </span>
            <kbd className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]'>
              ⌘K
            </kbd>
          </Button>
        </div>

        <div className='max-w-3xl space-y-2.5'>
          <h1 className='text-foreground text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl'>
            {t('helpCenter.title', 'Trung tâm Trợ giúp & Hướng dẫn Quản trị')}
          </h1>
          <p className='text-muted-foreground text-xs leading-relaxed sm:text-sm sm:leading-6'>
            {t(
              'helpCenter.description',
              'Hướng dẫn vận hành toàn diện: Phân cấp thẻ ngữ nghĩa & Wiki bách khoa (DAG), Quản trị tệp tin Media, Quản lý người dùng & Ma trận phân quyền, Soạn thảo nội dung CMS và Tùy biến thương hiệu.'
            )}
          </p>
        </div>

        {/* Live Search Bar */}
        <div className='mt-6 space-y-2'>
          <div className='border-border/80 bg-background/90 focus-within:ring-primary/20 focus-within:border-primary relative flex items-center rounded-xl border shadow-xs transition-all focus-within:ring-2'>
            <SearchIcon
              className='text-primary pointer-events-none absolute left-3.5 size-4.5 shrink-0'
              aria-hidden='true'
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'helpCenter.searchPlaceholder',
                'Tìm kiếm tính năng, quy trình hoặc câu hỏi trợ giúp (VD: DAG, wiki, upload, phân quyền, merge)...'
              )}
              className='placeholder:text-muted-foreground h-12 flex-1 border-0 pr-10 pl-11 text-sm font-medium shadow-none outline-none focus-visible:ring-0'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                aria-label={t('helpCenter.clearSearch', 'Xóa tìm kiếm')}
                className='text-muted-foreground hover:text-foreground absolute right-3 cursor-pointer rounded-md p-1 transition-colors'
              >
                <XIcon className='size-4' />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className='flex items-center justify-between px-1 text-xs'>
              <span className='text-primary font-medium'>
                {t('helpCenter.searchResultsCount', {
                  count: totalResults,
                  defaultValue: `Tìm thấy ${totalResults} kết quả phù hợp`,
                })}
              </span>
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='text-muted-foreground hover:text-foreground cursor-pointer underline'
              >
                {t('helpCenter.clearSearch', 'Xóa tìm kiếm')}
              </button>
            </div>
          )}
        </div>

        {/* Direct Module Jump Shortcuts */}
        <div className='border-border/60 mt-6 border-t pt-4'>
          <p className='text-muted-foreground mb-2.5 text-xs font-semibold'>
            {t('helpCenter.quickNav', 'Lối tắt Nhanh')}:
          </p>
          <div className='flex flex-wrap items-center gap-2'>
            {[
              {
                label: isVi ? 'Quản trị Thẻ' : 'Tags Governance',
                url: '/tags',
                icon: GitBranchIcon,
              },
              {
                label: isVi ? 'Bách khoa Wiki' : 'Tag Encyclopedia',
                url: '/tag-encyclopedias',
                icon: BookMarkedIcon,
              },
              {
                label: isVi ? 'Thư viện Media' : 'Media Library',
                url: '/files',
                icon: FolderSearchIcon,
              },
              {
                label: isVi ? 'Ma trận Quyền' : 'Roles & Permissions',
                url: '/roles',
                icon: ShieldCheckIcon,
              },
              {
                label: isVi ? 'Quản trị viên' : 'Admins',
                url: '/admins',
                icon: UsersIcon,
              },
              {
                label: isVi ? 'Trang CMS' : 'CMS Pages',
                url: '/cms-pages',
                icon: FileTextIcon,
              },
              {
                label: isVi ? 'Thương hiệu' : 'White-Label',
                url: '/white-labels',
                icon: PaletteIcon,
              },
              {
                label: isVi ? 'Cài đặt & 2FA' : 'Settings & 2FA',
                url: '/settings',
                icon: KeyRoundIcon,
              },
            ].map((shortcut) => {
              const SIcon = shortcut.icon
              return (
                <button
                  key={shortcut.url}
                  type='button'
                  onClick={() => navigate(shortcut.url)}
                  className='border-border/70 bg-background hover:bg-muted/60 hover:border-primary/50 text-foreground group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-2xs transition-all'
                >
                  <SIcon className='text-primary size-3.5 transition-transform group-hover:scale-110' />
                  <span>{shortcut.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Category Tabs Filter */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as HelpCategory)}
          className='w-full'
        >
          <TabsList className='h-auto flex-wrap gap-1'>
            <TabsTrigger value='all' className='gap-1.5 text-xs sm:text-sm'>
              {t('helpCenter.categoryAll', 'Tất cả chuyên mục')}
            </TabsTrigger>
            <TabsTrigger value='tags' className='gap-1.5 text-xs sm:text-sm'>
              <GitBranchIcon className='mr-1.5 size-3.5' />
              {t('helpCenter.categoryTags', 'Thẻ & Bách khoa (DAG)')}
            </TabsTrigger>
            <TabsTrigger value='files' className='gap-1.5 text-xs sm:text-sm'>
              <FolderSearchIcon className='mr-1.5 size-3.5' />
              {t('helpCenter.categoryFiles', 'Tệp tin & Media')}
            </TabsTrigger>
            <TabsTrigger
              value='security'
              className='gap-1.5 text-xs sm:text-sm'
            >
              <ShieldCheckIcon className='mr-1.5 size-3.5' />
              {t('helpCenter.categorySecurity', 'Bảo mật & Phân quyền')}
            </TabsTrigger>
            <TabsTrigger value='cms' className='gap-1.5 text-xs sm:text-sm'>
              <FileTextIcon className='mr-1.5 size-3.5' />
              {t('helpCenter.categoryCms', 'CMS & Thương hiệu')}
            </TabsTrigger>
            <TabsTrigger value='audit' className='gap-1.5 text-xs sm:text-sm'>
              <LayersIcon className='mr-1.5 size-3.5' />
              {t('helpCenter.categoryAudit', 'Kiểm toán & Hệ thống')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feature Modules Grid */}
      <section className='space-y-4'>
        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredModules.map((item) => {
            const Icon = item.icon
            const title = isVi ? item.titleVi : item.titleEn
            const desc = isVi ? item.descVi : item.descEn
            const bullets = isVi ? item.bulletsVi : item.bulletsEn
            const badge = isVi ? item.badgeVi : item.badgeEn

            return (
              <Card
                key={item.id}
                className='border-border/80 hover:border-border flex flex-col justify-between rounded-xl transition-all hover:shadow-xs'
              >
                <CardHeader className='space-y-3 pb-3'>
                  <div className='flex items-center justify-between'>
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                        item.accent
                      )}
                    >
                      <Icon className='size-5' />
                    </div>
                    <Badge variant='outline' className='text-[10px] font-bold'>
                      {badge}
                    </Badge>
                  </div>
                  <div>
                    <CardTitle className='text-base leading-snug font-bold'>
                      {title}
                    </CardTitle>
                    <CardDescription className='mt-1.5 line-clamp-3 text-xs leading-relaxed'>
                      {desc}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4 pt-0'>
                  <div className='space-y-1.5 border-t pt-3'>
                    {bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className='text-muted-foreground flex items-start gap-2 text-xs leading-relaxed'
                      >
                        <CheckCircle2Icon className='text-primary mt-0.5 size-3.5 shrink-0' />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => navigate(item.link)}
                    className='group/btn w-full cursor-pointer justify-between text-xs font-semibold shadow-2xs'
                  >
                    <span>
                      {t('helpCenter.openModule', 'Mở trang tính năng')}
                    </span>
                    <ArrowRightIcon className='size-3.5 transition-transform group-hover/btn:translate-x-1' />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className='border-border/70 text-muted-foreground space-y-2 rounded-2xl border border-dashed p-12 text-center text-xs'>
            <LifeBuoyIcon className='text-muted-foreground/40 mx-auto size-10' />
            <p className='text-foreground text-sm font-semibold'>
              {t(
                'helpCenter.noResults',
                'Không tìm thấy nội dung phù hợp với từ khóa'
              )}
            </p>
            <p className='text-muted-foreground mx-auto max-w-md text-xs'>
              {t(
                'helpCenter.noResultsDesc',
                'Thử tìm với các từ khóa khác như "DAG", "wiki", "merge", "upload", "role", hoặc xóa bộ lọc.'
              )}
            </p>
          </div>
        )}
      </section>

      {/* Standard Workflows & Useful Shortcuts Row */}
      <section className='grid gap-6 lg:grid-cols-[1fr_360px]'>
        {/* Left: Step-by-Step SOP Workflows */}
        <Card className='border-border/80 shadow-xs'>
          <CardHeader className='border-b pb-4'>
            <div className='flex items-center gap-2.5'>
              <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
                <BookOpenIcon className='size-4.5' aria-hidden='true' />
              </div>
              <div>
                <CardTitle className='text-base font-semibold'>
                  {t(
                    'helpCenter.workflowTitle',
                    'Quy trình Vận hành Tiêu chuẩn'
                  )}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {t(
                    'helpCenter.workflowDesc',
                    'Các bước thao tác chuẩn hóa dành cho Quản trị viên và Biên tập viên nội dung.'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-5 divide-y p-5'>
            {filteredWorkflows.map((workflow, index) => {
              const title = isVi ? workflow.titleVi : workflow.titleEn
              const steps = isVi ? workflow.stepsVi : workflow.stepsEn
              const tag = isVi ? workflow.tagVi : workflow.tagEn

              return (
                <div key={workflow.id} className={index > 0 ? 'pt-5' : ''}>
                  <div className='flex items-center gap-2 pb-2'>
                    <Badge
                      variant='secondary'
                      className='text-[10px] font-bold uppercase'
                    >
                      {tag}
                    </Badge>
                    <h3 className='text-foreground text-sm font-bold'>
                      {title}
                    </h3>
                  </div>

                  <div className='mt-2.5 space-y-2 pl-1'>
                    {steps.map((step, sIdx) => {
                      const [prefix, ...rest] = step.split(':')
                      return (
                        <div
                          key={sIdx}
                          className='flex items-start gap-2.5 text-xs leading-relaxed'
                        >
                          <span className='bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold'>
                            {sIdx + 1}
                          </span>
                          <p className='text-muted-foreground'>
                            {rest.length > 0 ? (
                              <>
                                <strong className='text-foreground font-semibold'>
                                  {prefix}:
                                </strong>
                                {rest.join(':')}
                              </>
                            ) : (
                              step
                            )}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Right: Quick Issue Diagnostics Checklist & Shortcuts */}
        <div className='space-y-6'>
          {/* Quick Issue Diagnostics Checklist */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2'>
                <LifeBuoyIcon className='text-primary size-4.5' />
                <CardTitle className='text-sm font-semibold'>
                  {t(
                    'helpCenter.checklistTitle',
                    'Kiểm tra Nhanh Khi Gặp Sự Cố'
                  )}
                </CardTitle>
              </div>
              <CardDescription className='text-xs'>
                {t(
                  'helpCenter.checklistDesc',
                  '4 bước tự kiểm tra nhanh trước khi yêu cầu hỗ trợ kỹ thuật chuyên sâu.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {DIAGNOSTIC_CHECKS.map((item) => {
                const text = isVi ? item.titleVi : item.titleEn
                const isChecked = Boolean(checkedDiagnostics[item.id])

                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => toggleDiagnostic(item.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all',
                      isChecked
                        ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20'
                        : 'border-border/70 hover:bg-muted/40 bg-card'
                    )}
                  >
                    <CheckCircle2Icon
                      className={cn(
                        'mt-0.5 size-4 shrink-0 transition-colors',
                        isChecked
                          ? 'text-emerald-500'
                          : 'text-muted-foreground/40'
                      )}
                    />
                    <span
                      className={cn(
                        'leading-relaxed transition-all',
                        isChecked
                          ? 'text-foreground line-through opacity-80'
                          : 'text-muted-foreground'
                      )}
                    >
                      {text}
                    </span>
                  </button>
                )
              })}

              {allDiagnosticsCompleted && (
                <div className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
                  ✓{' '}
                  {isVi
                    ? 'Bạn đã hoàn tất cả 4 bước chẩn đoán kiểm tra!'
                    : 'All 4 diagnostics steps completed!'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Card */}
          <Card className='border-border/80 shadow-xs'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-2'>
                <TerminalIcon className='text-primary size-4.5' />
                <CardTitle className='text-sm font-semibold'>
                  {t('helpCenter.shortcutsTitle', 'Phím tắt Thao tác Nhanh')}
                </CardTitle>
              </div>
              <CardDescription className='text-xs'>
                {t(
                  'helpCenter.shortcutsDesc',
                  'Tăng tốc độ điều hướng và xử lý tác vụ trên toàn portal.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2.5 text-xs'>
              {[
                {
                  keys: ['⌘', 'K'],
                  actionVi: 'Mở Menu Lệnh tìm kiếm nhanh & đổi giao diện',
                  actionEn: 'Open Command Menu for search & theme toggle',
                },
                {
                  keys: ['Esc'],
                  actionVi: 'Đóng hộp thoại, sheet drawer hoặc popup đang mở',
                  actionEn: 'Close open dialogs, sheet drawers, or modals',
                },
                {
                  keys: ['Tab'],
                  actionVi:
                    'Di chuyển tiêu điểm focus giữa các trường nhập liệu',
                  actionEn: 'Navigate keyboard focus through form controls',
                },
                {
                  keys: ['Enter'],
                  actionVi: 'Kích hoạt hành động hoặc gửi biểu mẫu hiện tại',
                  actionEn: 'Submit form or execute focused row action',
                },
              ].map((shortcut, idx) => (
                <div
                  key={idx}
                  className='border-border/60 bg-muted/20 flex items-center justify-between gap-3 rounded-lg border p-2'
                >
                  <span className='text-muted-foreground text-[11px]'>
                    {isVi ? shortcut.actionVi : shortcut.actionEn}
                  </span>
                  <div className='flex shrink-0 items-center gap-1'>
                    {shortcut.keys.map((k) => (
                      <kbd
                        key={k}
                        className='bg-background border-border text-foreground rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-2xs'
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Practical FAQs Collapsible Section */}
      <section className='border-border/80 bg-card rounded-2xl border p-5 shadow-xs sm:p-6'>
        <div className='flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl'>
              <HelpCircleIcon className='size-5' aria-hidden='true' />
            </div>
            <div>
              <h2 className='text-foreground text-base font-bold'>
                {t('helpCenter.faqTitle', 'Câu hỏi Thường gặp & Xử lý Sự cố')}
              </h2>
              <p className='text-muted-foreground text-xs'>
                {t(
                  'helpCenter.faqDesc',
                  'Giải đáp các thắc mắc phổ biến và cách khắc phục lỗi thường gặp trong quá trình vận hành.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className='mt-4 divide-y'>
          {filteredFaqs.map((faq) => {
            const question = isVi ? faq.questionVi : faq.questionEn
            const answer = isVi ? faq.answerVi : faq.answerEn
            const isOpen = Boolean(openFaqIds[faq.id])

            return (
              <Collapsible
                key={faq.id}
                open={isOpen}
                onOpenChange={() => toggleFaq(faq.id)}
                className='py-3.5'
              >
                <CollapsibleTrigger className='group/trigger hover:text-primary flex w-full cursor-pointer items-center justify-between text-left transition-colors'>
                  <span className='text-foreground group-hover/trigger:text-primary text-sm font-semibold'>
                    {question}
                  </span>
                  <ChevronDownIcon
                    className={cn(
                      'text-muted-foreground size-4 shrink-0 transition-transform duration-200',
                      isOpen && 'text-primary rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className='space-y-2 pt-2.5'>
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    {answer}
                  </p>
                  {faq.link && (
                    <Button
                      type='button'
                      variant='link'
                      size='sm'
                      onClick={() => navigate(faq.link!)}
                      className='text-primary h-auto cursor-pointer p-0 text-xs font-semibold'
                    >
                      <span>
                        {isVi
                          ? faq.linkTextVi || 'Xem chi tiết'
                          : faq.linkTextEn || 'View details'}
                      </span>
                      <ArrowRightIcon className='ml-1 size-3' />
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </section>

      {/* Escalated Support Contact Strip */}
      <section className='border-border/80 bg-muted/20 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-0.5'>
          <h3 className='text-foreground text-sm font-bold'>
            {t('helpCenter.contactSupport', 'Cần trợ giúp thêm?')}
          </h3>
          <p className='text-muted-foreground text-xs'>
            {t(
              'helpCenter.contactSupportDesc',
              'Nếu bạn gặp lỗi hệ thống hoặc cần cấp thêm quyền hạn nghiệp vụ, vui lòng liên hệ Quản trị viên hệ thống.'
            )}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => navigate('/logs')}
            className='h-9 cursor-pointer gap-1.5 text-xs shadow-2xs'
          >
            <LayersIcon className='size-3.5' />
            <span>{t('helpCenter.auditLogsBtn', 'Xem Nhật ký Hoạt động')}</span>
          </Button>

          <Button
            type='button'
            size='sm'
            onClick={() => setCommandMenuOpen(true)}
            className='h-9 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs'
          >
            <CommandIcon className='size-3.5' />
            <span>
              {t('helpCenter.triggerCommandMenu', 'Mở Menu Lệnh (⌘K)')}
            </span>
          </Button>
        </div>
      </section>
    </Main>
  )
}
