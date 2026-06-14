# NEST — Next-gen Enthusiastic Student Trust

Website tĩnh (HTML / CSS / JS thuần) cho quỹ học bổng **NEST**, tông màu xanh lá pastel,
hiệu ứng cao cấp (Three.js + GSAP) trên mọi trang.

## Bố cục website

| Tệp | Vai trò |
|-----|---------|
| `index.html`   | **Trang chính (landing)**. Mục: Giới thiệu, **Mô hình hoạt động** (dải 01·02·03 chạy ngang liên tục, di chuột để kéo qua lại), Tác động, lời kêu gọi (CTA). |
| `courses.html` | **Trang Khóa học** riêng. Đầu trang giới thiệu mục đích: khóa học **giá rẻ, chủ yếu để gây quỹ**; cuộn xuống là các khóa đang bán. |
| `patrons.html` | **Trang Mạnh thường quân** riêng (trước là "Vào website"). Gồm đồng hồ quỹ, các hạng nhà tài trợ, và **Bản đồ điểm đến** như một tiểu mục bên trong. |
| `admin.html`   | **Trang quản trị** — chỉnh sửa mọi nội dung (mật khẩu demo `nest2026`). |
| `landing.html` | Chuyển hướng → `index.html` (giữ link cũ còn chạy). |
| `map.html`     | Chuyển hướng → `patrons.html#map-section`. |

Điều hướng trên thanh menu: **Giới thiệu · Mô hình hoạt động · Tác động · Khóa học · Mạnh thường quân**.

## Mô hình hoạt động (dải chạy ngang)
Trên `index.html`, ba bước 01/02/03 chạy ngang liên tục. Khi **di chuột vào dải**, nó dừng và bạn
**kéo/di chuột qua lại** để xem; rời chuột thì chạy tiếp. Trên điện thoại có thể vuốt. (Mã trong
`js/fx.js`, hàm `initMarquee` — chỉnh tốc độ ở biến `speed`.)

## Quản trị nội dung (admin.html)
Quản lý: Quỹ (số tiền + mục tiêu), Mạnh thường quân (thêm/sửa/xoá + logo), Khóa học, Bản đồ
(tải ảnh + thêm địa danh, toạ độ, số sao). Lưu vào trình duyệt và hiển thị ngay.
Mục **Dữ liệu → Xuất JSON** để gửi cho lập trình viên.

> ⚠️ Đăng nhập demo + lưu localStorage chỉ trên 1 máy/trình duyệt. Để áp dụng cho mọi khách,
> lập trình viên cần backend + cơ sở dữ liệu và xác thực thật. JSON xuất ra dùng để nạp vào đó.

## Ảnh bản đồ
Ảnh bản đồ bạn gửi **chưa kèm được** (hệ thống không nhận tệp). Thêm bằng: **Admin → Bản đồ → Tải ảnh**,
hoặc lưu `images/map.jpg` rồi đặt đường dẫn trong `js/data.js` (`map.image`).

## Nội dung & dữ liệu (cho lập trình viên)
Tất cả nội dung nằm trong `js/data.js` (`DEFAULT_DATA`). Các trang đọc từ đây qua `js/fx.js`.
Điểm nối backend cho đồng hồ quỹ: hàm `renderFund()` / nguồn `D.fund` — thay bằng số từ máy chủ là tự cập nhật.

## Cấu trúc thư mục
```
NEST_PROJECT/
├─ index.html      trang chính (landing)
├─ courses.html    khóa học
├─ patrons.html    mạnh thường quân (+ bản đồ)
├─ admin.html      quản trị
├─ landing.html, map.html   chuyển hướng
├─ css/landing.css  hệ thống giao diện chung
├─ css/style.css    (giao diện cũ — không còn dùng cho các trang chính)
├─ js/data.js       nội dung trung tâm
├─ js/fx.js         engine: Three.js + GSAP + marquee + render + bản đồ
├─ js/admin.js      dashboard quản trị
└─ images/          ảnh: map.jpg, logo, ảnh khóa học, ảnh địa danh
```

## Kiểm thử trên trình duyệt
Mở các trang bằng Chrome/Edge (cần internet để tải Three.js & GSAP). Nhấn F12 → Console kiểm tra lỗi,
dùng nút device toolbar để thử desktop/mobile. Nếu muốn tôi tự kiểm tra DevTools, hãy kết nối tiện ích
Claude-in-Chrome rồi nhắn tôi.

## Đóng gói gửi lập trình viên
Nén cả thư mục `NEST_PROJECT` thành `.zip`, kèm tệp `HUONG-DAN.md` này làm tài liệu bàn giao.
