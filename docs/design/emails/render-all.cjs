const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "../../..");
const Handlebars = createRequire(path.join(root, "apps/api/package.json"))(
  "handlebars",
);
const templates = path.join(root, "apps/api/src/mail/templates");
const out = path.join(__dirname, "previews");
fs.mkdirSync(out, { recursive: true });
const renderer = Handlebars.create();
for (const name of ["email-layout", "email-button"])
  renderer.registerPartial(
    name,
    fs.readFileSync(path.join(templates, "partials", `${name}.hbs`), "utf8"),
  );
const email = "cosplayer@example.com";
const verify =
  "https://api.example.com/api/v1/user/auth/verify/email?token=preview-only-not-valid";
const reset =
  "https://kosume.crodic.click/auth/reset-password?token=preview-only-not-valid";
// Illustrative data only. This script renders files and never contacts a mail transport.
const fixtures = [
  [
    "user-email-verification",
    "Xác minh email người dùng",
    { email, url: verify },
  ],
  [
    "user-email-reset-password",
    "Đặt lại mật khẩu người dùng",
    { email, url: reset },
  ],
  [
    "user-email-restore",
    "Khôi phục tài khoản người dùng",
    { email, url: reset },
  ],
  [
    "admin-email-verification",
    "Xác minh tài khoản quản trị",
    { email: "moderator@example.com", url: verify },
  ],
  [
    "admin-email-reset-password",
    "Đặt lại mật khẩu quản trị",
    {
      email: "moderator@example.com",
      url: "https://admin.example.com/reset-password?token=preview-only-not-valid",
    },
  ],
  [
    "admin-account-deletion-requested",
    "Yêu cầu xóa tài khoản quản trị",
    { adminName: "Nguyễn An", deletionDate: "27/12/2026" },
  ],
  [
    "admin-account-hard-deleted",
    "Xác nhận xóa tài khoản quản trị",
    { adminName: "Nguyễn An", deletedAt: "27/11/2026" },
  ],
  [
    "admin-account-hard-deleted-report",
    "Báo cáo xóa tài khoản quản trị",
    { adminName: "Nguyễn An", deletedCount: 12 },
  ],
  [
    "admin-pending-posts-digest",
    "Báo cáo bài viết chờ duyệt",
    {
      currentDate: "27/11/2026",
      pendingCount: 18,
      reviewUrl: "https://admin.example.com/posts?status=pending_review",
    },
  ],
  [
    "email-verification",
    "Xác minh email — luồng dùng chung",
    { email, url: verify },
  ],
  [
    "email-reset-password",
    "Đặt lại mật khẩu — luồng dùng chung",
    { email, url: reset },
  ],
];
for (const [name, , context] of fixtures) {
  let html = renderer.compile(
    fs.readFileSync(path.join(templates, `${name}.hbs`), "utf8"),
    { strict: false },
  )(context);
  if (html.includes("{{")) throw new Error(`Unresolved variable in ${name}`);
  html = html.replace(
    'src="https://crodic.click/logo.png"',
    'src="../../../../apps/client/public/logo.png"',
  );
  fs.writeFileSync(path.join(out, `${name}.html`), html);
}
const links = fixtures
  .map(
    ([name, title]) =>
      `<li><a href="${name}.html">${title}</a><small>${name}.hbs</small></li>`,
  )
  .join("\n");
fs.writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Email hệ thống Kosume</title><style>body{max-width:840px;margin:40px auto;padding:0 24px;font:16px/1.6 Arial,sans-serif;color:#18181b;background:#fff}h1{font-size:28px;line-height:1.3;margin:0 0 12px}p,small{color:#52525b}ul{padding:0;list-style:none}li{padding:14px 0;border-bottom:1px solid #e4e4e7}a{color:#6d28d9;font-weight:600}small{display:block;font-size:13px}</style><h1>Email hệ thống Kosume</h1><p>11 template dùng layout đã được duyệt. Đây là bản xem trước với dữ liệu minh họa; các token không dùng để xác minh tài khoản thật.</p><ul>${links}</ul><p>Tạo lại bằng <code>node docs/design/emails/render-all.cjs</code>.</p></html>`,
);
console.log(
  `Rendered ${fixtures.length} production templates to docs/design/emails/previews/. No emails sent.`,
);
