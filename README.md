# NEST — Next-gen Enthusiastic Student Trust

Website (static front-end) cho quỹ học bổng **NEST**. HTML / CSS / JS thuần — không cần build.
Hiệu ứng: Three.js (nền hạt) + GSAP (animation cuộn). Có bảng quản trị sửa toàn bộ nội dung.

## 🚀 Chạy thử
Mở `index.html` bằng trình duyệt (cần Internet để tải Three.js & GSAP từ CDN), hoặc chạy server tĩnh:
```bash
python -m http.server 8000   # rồi mở http://localhost:8000
```

## 📁 Cấu trúc
| Đường dẫn | Vai trò |
|-----------|---------|
| `index.html` | Trang chính (landing): Giới thiệu · Mô hình hoạt động · Tác động · CTA |
| `courses.html` | Khóa học (giá rẻ, gây quỹ) + lối vào "Tạo khóa học của bạn" |
| `submit-course.html` | Hướng dẫn gửi khóa học demo (3 bước) |
| `patrons.html` | Mạnh thường quân: quỹ + nhà tài trợ + bản đồ + "Trở thành MTQ" |
| `admin.html` | Bảng quản trị (sửa mọi nội dung) |
| `landing.html`, `map.html` | Chuyển hướng (tương thích link cũ) |
| `css/landing.css`, `css/admin.css` | Giao diện |
| `js/data.js` | **Nguồn dữ liệu duy nhất** (nội dung, quỹ, nhà tài trợ, khóa học, bản đồ, tài khoản) |
| `js/fx.js` | Engine: Three.js + GSAP + marquee + render + bản đồ |
| `js/admin.js` | Logic bảng quản trị |
| `docs/` | Tài liệu bàn giao (.docx) |

## 🔑 Tài khoản admin (DEMO — đổi trước khi production)
| Vai trò | User | Pass |
|---------|------|------|
| Lập trình viên trưởng | `devlead` | `nest-dev-2026` |
| CEO | `ceo` | `nest-ceo-2026` |
| CFO | `cfo` | `nest-cfo-2026` |

> ⚠️ **Bảo mật:** đăng nhập hiện tại là demo phía trình duyệt (mật khẩu nằm trong `js/data.js`).
> Vì vậy hãy để repo ở chế độ **Private**. Trước khi lên thật, thay bằng xác thực có máy chủ.

## ✏️ Sửa nội dung
Tất cả nội dung ở `js/data.js` (object `DEFAULT_DATA`). Admin sửa và lưu vào localStorage; bấm
**Dữ liệu → Xuất JSON** rồi dán vào `DEFAULT_DATA` (hoặc nạp backend) để cố định cho mọi người.

## ✅ Việc cần làm để lên Production
Backend + CSDL · xác thực thật · cổng thanh toán & đồng hồ quỹ tự động · lưu ảnh trên server/CDN ·
form + email nhận khóa học (thay `mailto`) · thêm `images/map.jpg`. Chi tiết trong `docs/`.
