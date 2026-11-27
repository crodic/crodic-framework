# Email hệ thống Kosume

Toàn bộ 11 template đang dùng thiết kế xác minh tài khoản đã được duyệt.

[Mở danh sách xem trước](previews/index.html) · [Mẫu thiết kế gốc và đánh giá](kosume-verification/README.md)

## Cấu trúc chung

- `apps/api/src/mail/templates/partials/email-layout.hbs` sở hữu khung email, nhận diện Kosume, preheader, màu, spacing và responsive.
- `partials/email-button.hbs` sở hữu CTA, ghi chú theo ngữ cảnh và link dự phòng.
- Mỗi template chính chỉ chứa nội dung và biến nghiệp vụ riêng. HTML được render bằng Handlebars instance riêng cho mỗi lần gọi, không ghi partial hoặc context vào global state.
- Các partial nằm trong wildcard `**/*.hbs` đã có của Nest assets, nên được copy cùng bản build.

Màu tím `#7c3aed`, nội dung trắng/near-black và nút tương phản 5,70:1 giữ nguyên từ mẫu đã duyệt. Tên và nội dung trong template dùng tiếng Việt; subject và sender của luồng gửi vẫn lấy từ caller/config hiện có.

## Contract được giữ lại

| Nhóm                                                 | Biến từ caller                                  |
| ---------------------------------------------------- | ----------------------------------------------- |
| Xác minh và đặt lại mật khẩu, gồm user/admin/generic | `email`, `url`                                  |
| Khôi phục user                                       | `email`, `url`                                  |
| Yêu cầu xóa admin                                    | `adminName`, `deletionDate`, `logoUrl` tùy chọn |
| Xác nhận xóa admin                                   | `adminName`, `deletedAt`, `logoUrl` tùy chọn    |
| Báo cáo xóa admin                                    | `adminName`, `deletedCount`, `logoUrl` tùy chọn |
| Báo cáo chờ duyệt                                    | `currentDate`, `pendingCount`, `reviewUrl`      |

Nội dung giữ mốc chờ xóa 30 ngày, ngày xóa cụ thể, cách hủy yêu cầu bằng đăng nhập trước hạn, số tài khoản đã xóa và ngưỡng báo cáo 10 bài viết của template cũ. Email thông báo không có URL hành động từ caller sẽ không tự thêm một đường dẫn mới.

`logoUrl` từ các email quản trị vẫn được hỗ trợ và giữ tỷ lệ ảnh; nếu không có, layout dùng logo Kosume mặc định. Không thêm thời hạn link vì caller chưa truyền dữ liệu đó.

## Xem trước

Chạy từ repository root:

```sh
node docs/design/emails/render-all.cjs
```

Sau đó mở `docs/design/emails/previews/index.html`. Các file này là fixture, dùng địa chỉ `example.com` và token không hợp lệ; không dùng chúng để gửi email thật. Logo trong preview trỏ tới asset local để xem offline.

Các preview được render từ chính template sản xuất. Thay đổi layout/partial rồi chạy lại script để cập nhật toàn bộ bản xem trước.

## Kiểm tra

`mail-templates.spec.ts` render đủ 11 template qua `MailService`, kiểm tra contract, escaping, CTA/fallback, logo tùy chọn, số 0 trong báo cáo và việc context không rò giữa các lần render. `mail.service.spec.ts` tiếp tục kiểm tra đường gửi mail cũ.

Preview được kiểm tra trong browser trên mobile và desktop. Cần kiểm thử thêm Gmail/Outlook/Apple Mail thật trước khi kết luận tương thích mọi inbox hoặc cơ chế tự đổi dark mode.
