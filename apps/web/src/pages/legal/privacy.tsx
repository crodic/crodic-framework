import {
  Cookie,
  Database,
  Eye,
  Key,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { LegalLayout } from './legal-layout'

export function PrivacyPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language.startsWith('vi')

  return (
    <LegalLayout
      title={isVi ? 'Chính sách bảo mật' : 'Privacy Policy'}
      subtitle={
        isVi
          ? 'Cam kết bảo mật dữ liệu và quyền riêng tư thông tin trên nền tảng quản trị Crodic Framework.'
          : 'Our commitment to enterprise data protection, credential safety, and user privacy.'
      }
      lastUpdated={
        isVi
          ? 'Cập nhật lần cuối: Tháng 11/2026'
          : 'Last updated: November 2026'
      }
    >
      <div className='grid gap-8'>
        {/* Section 1 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <Eye className='size-4' />
            </div>
            <h2>
              {isVi
                ? '1. Dữ liệu chúng tôi thu thập'
                : '1. Information We Collect'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Để cung cấp dịch vụ quản trị an toàn và hiệu quả, Crodic Framework thu thập các nhóm thông tin tối thiểu sau:'
              : 'To deliver a reliable enterprise administration environment, Crodic Framework processes the following categories of data:'}
          </p>
          <ul className='text-muted-foreground list-disc space-y-1.5 pl-6 text-sm'>
            <li>
              <strong>
                {isVi ? 'Thông tin nhận danh:' : 'Identity & Contact:'}
              </strong>{' '}
              {isVi
                ? 'Địa chỉ email, họ tên, vai trò được phân quyền, và ảnh đại diện (nếu có).'
                : 'Email addresses, display names, assigned RBAC roles, and avatar assets.'}
            </li>
            <li>
              <strong>
                {isVi ? 'Thông tin xác thực:' : 'Authentication Data:'}
              </strong>{' '}
              {isVi
                ? 'Mật khẩu được băm an toàn (bcrypt/argon2), khóa bí mật 2FA mã hóa và mã khôi phục dự phòng.'
                : 'Strongly hashed credentials, encrypted TOTP secrets, and single-use backup recovery codes.'}
            </li>
            <li>
              <strong>
                {isVi ? 'Nhật ký an ninh (Audit Logs):' : 'Audit Telemetry:'}
              </strong>{' '}
              {isVi
                ? 'Địa chỉ IP, chuỗi User-Agent, mốc thời gian đăng nhập và chi tiết hành động thay đổi dữ liệu.'
                : 'Originating IP addresses, browser agents, authentication timestamps, and state mutation audits.'}
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <ShieldCheck className='size-4' />
            </div>
            <h2>
              {isVi
                ? '2. Biện pháp bảo vệ & Mã hóa'
                : '2. Security Safeguards & Encryption'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Chúng tôi áp dụng các tiêu chuẩn an toàn thông tin doanh nghiệp hàng đầu: xác thực JWT luân phiên, mã hóa TLS 1.3 trong truyền dẫn, phân tách quyền đa cấp (RBAC) và tường lửa ngăn chặn dò quét tự động.'
              : 'We enforce enterprise security benchmarks: ephemeral JWT rotations, TLS 1.3 transit encryption, strict RBAC perimeter controls, and automated rate-limiting to mitigate brute-force attempts.'}
          </p>
          <Card className='border-border/60 bg-muted/30 py-4'>
            <CardContent className='text-muted-foreground text-xs leading-relaxed'>
              {isVi
                ? 'Mật khẩu không bao giờ được lưu dưới dạng văn bản thô (plain-text). Tất cả token đặt lại mật khẩu và mã xác thực email đều có hạn dùng ngắn và bị hủy ngay sau khi sử dụng.'
                : 'Passwords are never stored in plaintext. Password reset tokens and email verification links carry short expiration windows and invalidate immediately upon consumption.'}
            </CardContent>
          </Card>
        </section>

        {/* Section 3 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <Cookie className='size-4' />
            </div>
            <h2>
              {isVi
                ? '3. Cookie & Bộ nhớ trình duyệt'
                : '3. Cookies & Local Storage'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Hệ thống sử dụng các bộ nhớ cục bộ chỉ phục vụ mục đích kỹ thuật cần thiết:'
              : 'Our client uses local browser storage strictly for necessary operational functionality:'}
          </p>
          <ul className='text-muted-foreground list-disc space-y-1.5 pl-6 text-sm'>
            <li>
              <strong>vite-ui-theme:</strong>{' '}
              {isVi
                ? 'Lưu lựa chọn giao diện sáng/tối để đồng bộ hiển thị mượt mà trước khi nạp giao diện.'
                : 'Persists light/dark mode preference for instant flicker-free rendering.'}
            </li>
            <li>
              <strong>runtime-theme:admin:</strong>{' '}
              {isVi
                ? 'Lưu bộ nhớ đệm cấu hình màu sắc OKLCH của hồ sơ White-Label đang kích hoạt.'
                : 'Caches active White-Label OKLCH tokens to accelerate styling bootstrap.'}
            </li>
            <li>
              <strong>i18nextLng:</strong>{' '}
              {isVi
                ? 'Ghi nhớ ngôn ngữ ưu tiên (Tiếng Việt / English).'
                : 'Retains chosen locale (Vietnamese / English).'}
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <Database className='size-4' />
            </div>
            <h2>
              {isVi
                ? '4. Thời gian lưu trữ & Khôi phục tài khoản'
                : '4. Data Retention & Account Recovery'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Khi tài khoản bị đánh dấu vô hiệu hoặc xóa mềm (soft-delete), dữ liệu được giữ trong thời gian ân hạn an toàn để quản trị viên có thể khôi phục khi cần. Sau thời gian này, dữ liệu sẽ được thanh lọc vĩnh viễn theo chính sách quản trị dữ liệu.'
              : 'When accounts undergo deactivation or soft deletion, records remain in a protected holding period allowing administrative restoration. After expiry, assets are purged in accordance with data cleanup policies.'}
          </p>
        </section>

        {/* Section 5 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <UserCheck className='size-4' />
            </div>
            <h2>
              {isVi ? '5. Quyền của chủ thể dữ liệu' : '5. Your Data Rights'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Bạn có quyền yêu cầu tra cứu nhật ký hoạt động cá nhân, cập nhật hồ sơ, thay đổi mật khẩu, bật/tắt 2FA, hoặc yêu cầu quản trị viên xóa dữ liệu theo quy định pháp luật hiện hành.'
              : 'You retain the right to inspect your audit trail, modify personal profiles, update authentication factors, toggle 2FA keys, or request account decommissioning through your administrator.'}
          </p>
        </section>

        {/* Section 6 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
              <Key className='size-4' />
            </div>
            <h2>
              {isVi
                ? '6. Liên hệ phụ trách quyền riêng tư'
                : '6. Contact & Data Officer'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào về quyền riêng tư dữ liệu, vui lòng gửi yêu cầu đến quản trị viên Crodic Framework hoặc người phụ trách Crodic Crystal.'
              : 'For inquiries or data subject access requests concerning the Crodic Framework environment, contact the system administrator or reach out to Crodic Crystal.'}
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

export default PrivacyPage
