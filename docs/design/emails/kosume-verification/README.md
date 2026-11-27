# Email xác minh tài khoản Kosume — mẫu đề xuất

Mẫu đã được duyệt và áp dụng cho toàn bộ email hệ thống. Khung sản xuất hiện nằm ở `apps/api/src/mail/templates/partials/email-layout.hbs`; đây là bản tham chiếu của vòng duyệt. [Xem các template đã triển khai](../README.md). Không email nào được gửi khi tạo preview.

- [Mở bản HTML xem trước](preview.html)
- [Template Handlebars](template.hbs)
- [Bản text](preview.txt)
- [Ảnh desktop](preview-desktop.png) · [Ảnh mobile](preview-mobile.png)

## Đánh giá template hiện tại

Phương pháp: hai đánh giá độc lập, A `/root/email_design_review` đọc thiết kế và nhận diện; B `/root/email_technical_review` đọc cấu trúc HTML, biến template và chạy detector. Đối tượng chính là `apps/api/src/mail/templates/user-email-verification.hbs`, đối chiếu các template xác minh, khôi phục, đặt lại mật khẩu và thông báo quản trị trong cùng thư mục.

Detector trả `[]`; các vấn đề dưới đây được xác nhận bằng source và phép tính tương phản. Đây không phải chứng nhận tương thích với các email client.

| Mức | Vấn đề                                                  | Bằng chứng và tác động                                                                                                                                                                                                   |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Nhận diện người gửi không thống nhất                    | Email xác minh người dùng dùng chữ `U` ở header, footer ghi `Crodic Portal`; email khôi phục ghi `Crodic Framework`. Người đang tạo tài khoản Kosume cần nhận ra cùng một sản phẩm.                                      |
| P1  | Nút xác minh thiếu tương phản                           | Chữ trắng 15px trên `#16a34a` đạt khoảng 3,30:1. Nút khôi phục trên `#10b981` đạt 2,54:1. Cỡ chữ này cần 4,5:1.                                                                                                          |
| P2  | Nhiều lớp trang trí cho một thao tác đơn giản           | Header tối, pill trạng thái, card radius 24px với shadow lớn, ô URL riêng và alert màu cùng tranh nhau làm điểm nhấn.                                                                                                    |
| P2  | Template người dùng thiếu chăm chút cho mobile và inbox | `user-email-verification.hbs` không có head/viewport, preheader hay media query; padding nội dung luôn là 36px. Bản generic `email-verification.hbs` đã có một số phần này nhưng không phải bản mà luồng user đang chọn. |
| P2  | Cấu trúc email cần kiểm chứng thêm                      | Header dùng float; chiều rộng chỉ dựa vào max-width. Đây là rủi ro cần kiểm tra trên Outlook thực tế, chưa phải lỗi Outlook đã tái hiện.                                                                                 |
| P3  | Copy và ngôn ngữ chưa đồng bộ                           | Các email user hiện dùng tiếng Anh dù sản phẩm có VI/EN. Mẫu này minh họa tiếng Việt; khi áp dụng nên chọn nội dung và subject theo locale của người nhận.                                                               |

Những điểm nên giữ: một CTA chính, hiển thị đúng tài khoản, có link dự phòng và hướng dẫn bỏ qua email ngoài ý muốn. Các template đã dùng presentation table và inline style, phù hợp để tiếp tục phát triển.

### Điểm đánh giá từ source

| Heuristic có đủ bằng chứng        | Điểm      |
| --------------------------------- | --------- |
| Ngôn ngữ và tác vụ dễ hiểu        | 3/4       |
| Nhất quán và quy ước              | 2/4       |
| Nhận ra sản phẩm và tài khoản     | 3/4       |
| Tối giản và thứ bậc thị giác      | 2/4       |
| Khôi phục khi nút không hoạt động | 3/4       |
| **Tổng phần đã đánh giá**         | **13/20** |

Các heuristic về trạng thái sau khi nhấn, phòng ngừa lỗi, quyền điều khiển, hiệu quả thao tác và trợ giúp xuyên suốt chưa được chấm vì chưa thử luồng xác minh thật. Đây là điểm của năm mặt có thể đọc từ template, không phải điểm kiểm thử toàn bộ luồng tài khoản.

## Hướng thiết kế mẫu mới

- Dùng logo có sẵn tại `apps/client/public/logo.png` và tên Kosume bằng chữ, vẫn nhận diện được khi ảnh bị chặn.
- Giữ một khối nội dung trắng rộng tối đa 600px, viền nhẹ, không shadow hay banner tối. Chỉ có một nút hành động chính.
- Màu CTA `#7c3aed` được đối chiếu với primary runtime của `https://kosume.crodic.click/` ngày 27/11/2026: `oklch(0.5413 0.2466 293.0090)`. Màu này đạt 5,70:1 với chữ trắng.
- Email cần màu inline cụ thể. Các giá trị này là bản chốt của theme Kosume cho mẫu, không phụ thuộc Tailwind hay CSS variables trong inbox. Nếu mở rộng white label, nên resolve token phía server trước khi render.
- Heading 28px trên desktop, 26px trên mobile; nội dung 16px/26px; nút cao khoảng 50px. Khoảng cách gom theo nhóm nội dung, không có badge hoặc icon trang trí trong nội dung.
- Có preheader, viewport, link dự phòng có thể copy, MSO width fallback và phần hỗ trợ padding nút cho Outlook. Corner có thể vuông trên email client cũ mà nội dung vẫn dùng được.

## File và contract

`template.hbs` chỉ cần đúng hai biến của luồng user hiện tại:

```js
{
  (email, url);
}
```

Luồng hiện tại chọn `user-email-verification`, subject `Verify your account`, và tạo URL `${appUrl}/api/v1/user/auth/verify/email?token=${token}` trong `user-account-recovery.service.ts`. Mẫu giữ nguyên mục đích của URL này; không dựng một đường dẫn frontend mới.

Subject đề xuất khi triển khai bản VI: **Xác minh email của bạn trên Kosume**.

Không thêm tên người dùng, thời hạn link, email hỗ trợ hoặc cam kết bảo mật vì context hiện chưa cung cấp những dữ liệu đó. Template vẫn dùng escaping mặc định của Handlebars cho `email` và `url`.

`preview.html` dùng địa chỉ `example.com`, token minh họa không hợp lệ và logo tương đối từ source để xem offline. Khi áp dụng dùng `template.hbs`, không dùng fixture preview làm email thật. `preview.txt` là gợi ý bản text; mail service hiện chưa nối bản text vào mail gửi đi.

Tạo lại preview từ repository root:

```sh
node docs/design/emails/kosume-verification/render.cjs
```

## Đã kiểm tra và giới hạn

- Render Handlebars bằng đúng dependency của `apps/api`, strict mode, chỉ `{ email, url }`.
- Một H1, không còn placeholder sau render, URL trong CTA và fallback giống nhau, query string được escape.
- Template render nhỏ hơn 15KB. CTA 5,70:1; body trên trắng 7,73:1; link dự phòng 7,10:1.
- Đã xem bản browser ở 1440×900 và 390×844. Email dài và URL dài được thử thêm ở viewport hẹp.
- Chưa gửi qua mail transport hoặc kiểm thử trong Gmail, Outlook và Apple Mail thực tế. Browser preview không mô phỏng cơ chế tự đổi màu của các inbox đó.

Sau khi duyệt mẫu, người dùng đã yêu cầu áp dụng cho toàn bộ template. Xem `../README.md` để biết cấu trúc dùng chung và cách render tất cả email hiện tại.
