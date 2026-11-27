const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "../../../..");
const apiRequire = createRequire(path.join(root, "apps/api/package.json"));
const Handlebars = apiRequire("handlebars");

// Preview-only fixture. No mail is sent and this is not a usable verification token.
const context = {
  email: "cosplayer@example.com",
  url: "https://api.crodic.click/api/v1/user/auth/verify/email?token=preview-only-not-a-valid-token",
};
const template = fs.readFileSync(path.join(__dirname, "template.hbs"), "utf8");
const render = Handlebars.compile(template, { strict: true });
const html = render(context);
fs.writeFileSync(
  path.join(__dirname, "preview.html"),
  html.replace(
    'src="https://crodic.click/logo.png"',
    'src="../../../../apps/client/public/logo.png"',
  ),
);
fs.writeFileSync(
  path.join(__dirname, "preview.txt"),
  `Kosume\n\nXác minh email của bạn\n\nChào bạn,\n\nXác minh địa chỉ email dưới đây để hoàn tất đăng ký tài khoản Kosume:\n\n${context.email}\n\n${context.url}\n\nNếu bạn không tạo tài khoản này, bạn có thể bỏ qua email.\n\nKosume · Cộng đồng sáng tạo cosplay\n`,
);
console.log(
  "Rendered preview.html and preview.txt with illustrative data. No email sent.",
);
