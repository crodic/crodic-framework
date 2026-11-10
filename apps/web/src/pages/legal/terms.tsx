import { FileText, Lock, Scale, Server, Shield, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { LegalLayout } from './legal-layout'

export function TermsPage() {
  const { i18n } = useTranslation()
  const isVi = i18n.language.startsWith('vi')

  return (
    <LegalLayout
      title={isVi ? 'Điều khoản dịch vụ' : 'Terms of Service'}
      subtitle={
        isVi
          ? 'Quy định và thỏa thuận sử dụng nền tảng quản trị Crodic Framework dành cho doanh nghiệp và quản trị viên.'
          : 'Terms and conditions governing the use of the Crodic Framework enterprise administration platform.'
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
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Scale className='size-4' />
            </div>
            <h2>
              {isVi ? '1. Chấp thuận điều khoản' : '1. Acceptance of Terms'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Khi truy cập hoặc sử dụng Crodic Framework, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản này. Nếu không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng dịch vụ ngay lập tức.'
              : 'By accessing or using the Crodic Framework portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to any part of these terms, you must discontinue use immediately.'}
          </p>
        </section>

        {/* Section 2 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Lock className='size-4' />
            </div>
            <h2>
              {isVi
                ? '2. Tài khoản và Bảo mật 2FA'
                : '2. Account Security & Two-Factor Authentication'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Người dùng có trách nhiệm bảo mật thông tin đăng nhập, bao gồm mật khẩu và mã xác thực 2 bước (2FA). Mọi hoạt động phát sinh từ tài khoản của bạn sẽ thuộc phạm vi trách nhiệm của bạn hoặc tổ chức quản lý được cấp phép.'
              : 'Users are strictly responsible for safeguarding authentication credentials, including passwords and Two-Factor Authentication (2FA) tokens. Any activity performed under your credentials is presumed authorized by your organization.'}
          </p>
          <Card className='border-border/60 bg-muted/30 py-4'>
            <CardContent className='text-muted-foreground text-xs leading-relaxed'>
              {isVi
                ? 'Lưu ý: Hệ thống lưu nhật ký truy cập (Audit Logs) bao gồm IP, thiết bị và thời gian cho mỗi phiên làm việc nhằm mục đích kiểm tra an ninh và ngăn chặn xâm nhập trái phép.'
                : 'Note: The platform logs access events (Audit Logs) including IP addresses, user agents, and timestamps for security auditability and anomaly prevention.'}
            </CardContent>
          </Card>
        </section>

        {/* Section 3 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Shield className='size-4' />
            </div>
            <h2>
              {isVi
                ? '3. Phân quyền RBAC & Quy định sử dụng'
                : '3. Role-Based Access Control (RBAC) & Acceptable Use'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Quyền truy cập vào các tính năng như quản trị người dùng, nhật ký email, quản lý thẻ dữ liệu và cấu hình hệ thống được điều chỉnh nghiêm ngặt thông qua ma trận RBAC. Bạn cam kết không thực hiện bất kỳ hành vi nào sau đây:'
              : 'Access to system capabilities such as user administration, email dispatch logs, taxonomy management, and system configuration is governed by strict RBAC policies. You agree not to:'}
          </p>
          <ul className='text-muted-foreground list-disc space-y-1.5 pl-6 text-sm'>
            <li>
              {isVi
                ? 'Tìm cách vượt qua cơ chế kiểm soát quyền hoặc leo thang đặc quyền trái phép.'
                : 'Attempt to bypass authorization checks or escalate privileges beyond assigned roles.'}
            </li>
            <li>
              {isVi
                ? 'Gửi mã độc, tấn công từ chối dịch vụ (DoS) hoặc khai thác lỗ hổng hệ thống.'
                : 'Inject malicious payloads, launch denial of service attacks, or exploit software vulnerabilities.'}
            </li>
            <li>
              {isVi
                ? 'Sử dụng hệ thống hàng đợi hoặc API tự động ngoài phạm vi hạn ngạch được thiết lập.'
                : 'Abuse asynchronous queue processors or APIs exceeding established rate limits.'}
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Sparkles className='size-4' />
            </div>
            <h2>
              {isVi
                ? '4. Sở hữu trí tuệ & Tùy biến White-Label'
                : '4. Intellectual Property & White-Label Customization'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Toàn bộ mã nguồn cốt lõi, kiến trúc phần mềm và tài liệu của Crodic Framework thuộc quyền sở hữu của Crodic Crystal. Tính năng White-Label cho phép doanh nghiệp cấu hình giao diện, bảng màu OKLCH, phông chữ và logo thương hiệu theo giấy phép thương mại hợp lệ.'
              : 'All core architecture, framework source code, and design tokens of Crodic Framework are protected intellectual property. White-label features permit enterprise customization of OKLCH palettes, typography, and visual assets subject to your license agreement.'}
          </p>
        </section>

        {/* Section 5 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <Server className='size-4' />
            </div>
            <h2>
              {isVi
                ? '5. Độ tin cậy & Cam kết hoạt động'
                : '5. Service Reliability & Health Monitoring'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Crodic Framework được thiết kế với cơ chế giám sát thời gian thực cho Redis, BullMQ, bộ nhớ đệm và cơ sở dữ liệu. Mặc dù chúng tôi nỗ lực duy trì chỉ số khả dụng 99.9%, hệ thống có thể cần tạm dừng định kỳ để bảo trì hoặc nâng cấp phiên bản có thông báo trước.'
              : 'The framework includes real-time health-check routines for Redis, BullMQ workers, memory heap, and relational databases. While targeting 99.9% uptime, scheduled maintenance or critical patches may require brief maintenance windows.'}
          </p>
        </section>

        {/* Section 6 */}
        <section className='space-y-3'>
          <div className='text-foreground flex items-center gap-2.5 text-lg font-semibold'>
            <div className='bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg'>
              <FileText className='size-4' />
            </div>
            <h2>
              {isVi
                ? '6. Thông tin liên hệ & Pháp lý'
                : '6. Legal Inquiries & Governance'}
            </h2>
          </div>
          <p className='text-muted-foreground text-sm leading-relaxed'>
            {isVi
              ? 'Mọi câu hỏi liên quan đến điều khoản dịch vụ hoặc cấp phép doanh nghiệp, vui lòng liên hệ đội ngũ Crodic Crystal qua cổng hỗ trợ chính thức.'
              : 'For inquiries regarding enterprise licensing, service-level agreements, or compliance, please reach out to Crodic Crystal through the official portal support channel.'}
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}

export default TermsPage
