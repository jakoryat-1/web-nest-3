/* =========================================================
   data.js — single source of truth for the whole NEST site
   Public pages render from here; the Admin dashboard edits it.
   Edits are saved to the browser (localStorage). To make them
   permanent for everyone, the developer seeds DEFAULT_DATA or a
   backend with the JSON exported from Admin.
   ========================================================= */

const DEFAULT_DATA = {

  /* ---- admin accounts (DEMO ONLY — see warning below) ---- */
  /* ⚠️ These passwords ship in client-side JS and are NOT secure.
     They exist so 3 people can use the demo dashboard. Before going
     live, the developer MUST replace this with real server-side
     authentication (hashed passwords, sessions/JWT). */
  users: [
    { user: "devlead", pass: "nest-dev-2026", name: "Lập trình viên trưởng", role: "Lead Developer" },
    { user: "ceo",     pass: "nest-ceo-2026", name: "Giám đốc điều hành",    role: "CEO" },
    { user: "cfo",     pass: "nest-cfo-2026", name: "Giám đốc tài chính",    role: "CFO" }
  ],

  org: {
    name: "NEST",
    full: "Next-gen Enthusiastic Student Trust",
    tagline: "Quỹ học bổng cho thế hệ học sinh nhiệt huyết",
    email: "quynest.scholarship@gmail.com",
    hotline: "0123 456 789"
  },

  fund: { current: 185400000, goal: 500000000 },

  supporters: {
    platinum: [
      { name: "Tên nhà tài trợ", field: "Lĩnh vực hoạt động", logo: "" },
      { name: "Tên nhà tài trợ", field: "Lĩnh vực hoạt động", logo: "" }
    ],
    diamond: [
      { name: "Tên nhà tài trợ", field: "Lĩnh vực", logo: "" },
      { name: "Tên nhà tài trợ", field: "Lĩnh vực", logo: "" },
      { name: "Tên nhà tài trợ", field: "Lĩnh vực", logo: "" }
    ],
    gold: [
      { name: "Tên", field: "Lĩnh vực", logo: "" },
      { name: "Tên", field: "Lĩnh vực", logo: "" },
      { name: "Tên", field: "Lĩnh vực", logo: "" },
      { name: "Tên", field: "Lĩnh vực", logo: "" }
    ]
  },

  courses: [
    {
      track: "Tiếng Anh",
      sub: "Từ giao tiếp cơ bản đến luyện thi quốc tế.",
      items: [
        { title: "Tiếng Anh giao tiếp hằng ngày", level: "Cơ bản", desc: "Tự tin nói chuyện trong các tình huống thường gặp: chào hỏi, mua sắm, du lịch.", weeks: 8, lessons: 24, rating: 4.8, price: 490000, image: "" },
        { title: "Tiếng Anh công sở", level: "Trung cấp", desc: "Email, thuyết trình và họp hành chuyên nghiệp bằng tiếng Anh.", weeks: 10, lessons: 30, rating: 4.7, price: 690000, image: "" },
        { title: "Luyện thi IELTS 6.5+", level: "Nâng cao", desc: "Chiến lược làm bài 4 kỹ năng, chữa đề và mô phỏng thi thật.", weeks: 12, lessons: 40, rating: 4.9, price: 1290000, image: "" }
      ]
    },
    {
      track: "Tài chính cá nhân",
      sub: "Quản lý tiền bạc thông minh và bền vững.",
      items: [
        { title: "Lập ngân sách & tiết kiệm", level: "Cơ bản", desc: "Xây dựng thói quen chi tiêu hợp lý và quỹ dự phòng cho bản thân.", weeks: 6, lessons: 18, rating: 4.8, price: 390000, image: "" },
        { title: "Nhập môn đầu tư", level: "Trung cấp", desc: "Hiểu cổ phiếu, trái phiếu, quỹ và cách phân bổ rủi ro an toàn.", weeks: 8, lessons: 26, rating: 4.7, price: 790000, image: "" },
        { title: "Quản lý nợ thông minh", level: "Miễn phí", desc: "Cách thoát khỏi nợ xấu và xây dựng điểm tín dụng tốt. Khoá học cộng đồng miễn phí.", weeks: 4, lessons: 12, rating: 4.6, price: 0, image: "" }
      ]
    }
  ],

  map: {
    image: "",
    places: [
      { x: 28, y: 35, name: "Địa danh mẫu 1", category: "Di tích lịch sử", image: "", description: "Mô tả ngắn gọn về địa danh. Thay nội dung này bằng thông tin thật.", history: "Lịch sử và câu chuyện của địa danh sẽ hiển thị ở đây.", rating: 4.5 },
      { x: 55, y: 48, name: "Địa danh mẫu 2", category: "Thắng cảnh", image: "", description: "Mô tả ngắn gọn về địa danh thứ hai.", history: "Thông tin lịch sử của địa danh thứ hai.", rating: 5 },
      { x: 42, y: 68, name: "Địa danh mẫu 3", category: "Làng nghề", image: "", description: "Mô tả ngắn gọn về địa danh thứ ba.", history: "Thông tin lịch sử của địa danh thứ ba.", rating: 4 },
      { x: 70, y: 30, name: "Địa danh mẫu 4", category: "Điểm đến", image: "", description: "Mô tả ngắn gọn về địa danh thứ tư.", history: "Thông tin lịch sử của địa danh thứ tư.", rating: 3.5 }
    ]
  },

  /* =========================================================
     CONTENT — mọi chữ hiển thị trên các trang (admin sửa được)
     Trang đọc các giá trị này qua data-bind="content.<đường dẫn>".
     ========================================================= */
  content: {
    index: {
      heroPill: "Next-gen Enthusiastic Student Trust",
      heroLine1: "Gieo tri thức,",
      heroLine2: "ươm mầm tương lai.",
      heroLead: "NEST là quỹ học bổng nuôi dưỡng thế hệ học sinh nhiệt huyết — học để giỏi hơn, và để chắp cánh cho những bạn vừa tài năng vừa cần được giúp đỡ.",
      heroBtnPrimary: "Đóng góp cho quỹ →",
      heroBtnGhost: "Tìm hiểu thêm",
      aboutEyebrow: "Vì sao là NEST",
      aboutTitle: "Một mô hình minh bạch nơi việc học tự nuôi việc học.",
      aboutSub: "Học phí mỗi khoá học chảy thẳng vào quỹ. Bạn nhận kiến thức — một bạn khác nhận học bổng.",
      processEyebrow: "Hành trình",
      processTitle: "Mô hình hoạt động",
      processSub: "Ba bước, một vòng tròn tử tế — chạy liên tục. Di chuột vào để kéo qua lại.",
      impactTitle: "Mỗi khoá học là một viên gạch xây nên tương lai của ai đó.",
      ctaEyebrow: "Sẵn sàng chưa?",
      ctaTitle: "Học một điều mới hôm nay. Thay đổi một cuộc đời ngày mai.",
      ctaBtnPrimary: "Khám phá khoá học",
      ctaBtnGhost: "Trở thành nhà tài trợ"
    },
    courses: {
      heroPill: "Học giá rẻ · Gây quỹ là chính",
      heroLine1: "Khóa học giá rẻ,",
      heroLine2: "ý nghĩa thì vô giá.",
      heroLead: "Các khóa học của NEST được giữ ở mức học phí thấp nhất có thể. Mục tiêu chính không phải lợi nhuận — mà là gây quỹ học bổng. Bạn trả một khoản nhỏ để học, và gần như toàn bộ số đó trở thành cơ hội đến trường cho một bạn học sinh khác.",
      heroBtnPrimary: "Xem các khóa đang mở ↓",
      heroBtnGhost: "Ủng hộ quỹ",
      listEyebrow: "Đang mở đăng ký",
      listTitle: "Các khóa học đang bán",
      listSub: "Chọn một khóa, bắt đầu học, và cùng lúc góp một viên gạch cho quỹ học bổng.",
      createEyebrow: "Dành cho giảng viên",
      createTitle: "Tạo khóa học của bạn",
      createSub: "Bạn có chuyên môn muốn chia sẻ? Gửi khóa học demo cho NEST chỉ với 3 bước cực kỳ đơn giản — ai cũng làm được.",
      createBtn: "Xem hướng dẫn 3 bước →",
      ctaTitle: "Một khóa học cho bạn. Một học bổng cho người khác."
    },
    patrons: {
      heroPill: "Những người đồng hành cùng NEST",
      heroLine1: "Mạnh thường quân,",
      heroLine2: "những người gieo hạt.",
      heroLead: "Mỗi đóng góp đều được ghi nhận công khai. Cảm ơn các cá nhân và tổ chức đã tin tưởng NEST — logo và hình ảnh doanh nghiệp được trân trọng giới thiệu tại đây như một lời tri ân.",
      heroBtnPrimary: "Xem danh sách ↓",
      heroBtnGhost: "Bản đồ điểm đến",
      fundLabel: "Tổng quỹ học bổng đã gây được",
      supEyebrow: "Tri ân",
      supTitle: "Các hạng mạnh thường quân",
      supSub: "Bạch Kim · Kim Cương · Vàng — xếp theo mức đồng hành cùng quỹ.",
      mapEyebrow: "Tiểu mục · Bản đồ",
      mapTitle: "Bản đồ điểm đến",
      mapSub: "Di chuột (máy tính) hoặc chạm (điện thoại) vào các chấm xanh để xem hình ảnh, mô tả, lịch sử và đánh giá sao của từng địa danh.",
      becomeEyebrow: "Chung tay",
      becomeTitle: "Trở thành mạnh thường quân",
      becomeSub: "Chỉ 3 bước đơn giản để đồng hành cùng NEST và cùng gieo những hạt mầm tương lai.",
      give1Title: "Chuyển tiền vào tài khoản",
      give1Desc: "Chuyển khoản số tiền đóng góp của bạn vào tài khoản của quỹ NEST (thông tin bên dưới).",
      give2Title: "Ghi rõ thông tin",
      give2Desc: "Trong nội dung chuyển khoản, ghi rõ tên tổ chức/cá nhân và lời nhắn/thông điệp của bạn.",
      give3Title: "Chờ email xác nhận",
      give3Desc: "Quỹ sẽ gửi email liên hệ để xác nhận và tri ân đóng góp của bạn.",
      bankInfo: "Ngân hàng: [Tên ngân hàng]  •  Số tài khoản: [Số TK]  •  Chủ tài khoản: QUỸ HỌC BỔNG NEST"
    },
    submit: {
      heroPill: "Trở thành giảng viên NEST",
      heroLine1: "3 bước đơn giản,",
      heroLine2: "ai cũng làm được.",
      heroLead: "Bạn không cần là chuyên gia công nghệ. Chỉ cần chuyên môn và một chút tâm huyết — gửi khóa học demo về email của quỹ, đội ngũ NEST sẽ lo phần còn lại.",
      step1Title: "Giới thiệu khóa học",
      step1Desc: "Tạo một file Word / Excel / PDF ngắn gọn gồm: giới thiệu khóa học, mục tiêu, đối tượng hướng tới và syllabus (đề cương) ngắn gọn.",
      step2Title: "Đính kèm 1 video bài giảng",
      step2Desc: "Quay 1 video bài giảng mẫu dài ít nhất 15 phút để NEST cảm nhận phong cách giảng dạy của bạn.",
      step3Title: "Chờ phê duyệt",
      step3Desc: "Gửi tất cả về email của quỹ và chờ phản hồi. Đội ngũ NEST sẽ xem xét và liên hệ lại với bạn.",
      reassure: "Thật sự chỉ có vậy. Không phí, không thủ tục rườm rà — 3 bước ngắn gọn, rất dễ, và ai cũng có thể làm được."
    },

    /* card collections */
    heroStats: [
      { n: "185", c: "Triệu ₫ đã gây quỹ" },
      { n: "240", c: "Học bổng đã trao" },
      { n: "32",  c: "Mạnh thường quân" }
    ],
    features: [
      { ic: "sprout", h: "Học để cho đi", p: "Tham gia các khoá tiếng Anh và tài chính cá nhân; toàn bộ học phí trở thành học bổng." },
      { ic: "eye", h: "Minh bạch tuyệt đối", p: "Đồng hồ quỹ thời gian thực và danh sách mạnh thường quân công khai trên website." },
      { ic: "cap", h: "Trao đúng người", p: "Học bổng xét theo hai tiêu chí: thành tích học tập và hoàn cảnh gia đình." }
    ],
    processSteps: [
      { num: "01", h: "Bạn học", p: "Đăng ký một khoá học bạn quan tâm với mức học phí hợp lý." },
      { num: "02", h: "Quỹ lớn lên", p: "Học phí được cộng vào quỹ NEST và hiển thị công khai theo thời gian thực." },
      { num: "03", h: "Học bổng trao đi", p: "Quỹ trao học bổng cho học sinh giỏi có hoàn cảnh khó khăn — và vòng tròn tiếp tục." }
    ],
    impactStats: [
      { n: "185", c: "Triệu ₫ gây quỹ" },
      { n: "240", c: "Học bổng đã trao" },
      { n: "18",  c: "Khoá học" },
      { n: "96",  c: "% học phí vào quỹ" }
    ],
    whyFeatures: [
      { ic: "coin", h: "Học phí tối thiểu", p: "Chỉ đủ để vận hành. Không đặt nặng lợi nhuận — đặt nặng tác động." },
      { ic: "community", h: "Học phí = quỹ", p: "Phần lớn mỗi đồng học phí được chuyển thẳng vào quỹ học bổng, công khai minh bạch." },
      { ic: "growth", h: "Kiến thức thật", p: "Tiếng Anh và tài chính cá nhân — những kỹ năng dùng được ngay trong đời sống và công việc." }
    ]
  }
};

/* ---------- storage layer ---------- */
const NEST_STORE_KEY = "nest_site_data_v2";
function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
function mergeDefaults(saved){
  // ensure new default keys exist even if an older save is loaded
  var base = deepClone(DEFAULT_DATA);
  if(!saved) return base;
  function merge(dst, src){
    for(var k in src){
      if(src[k] && typeof src[k]==="object" && !Array.isArray(src[k])){
        dst[k] = merge(dst[k]||{}, src[k]);
      } else { dst[k] = src[k]; }
    }
    return dst;
  }
  return merge(base, saved);
}
/* ---------- NEW STORAGE LAYER (GỌI API TỪ BACKEND PYTHON) ---------- */

// Hàm lấy dữ liệu bất đồng bộ từ Server
async function fetchWebData() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/get-data');
        if (!response.ok) throw new Error("Mạng lỗi");
        const data = await response.json();
        
        // Nếu DB rỗng, lấy DEFAULT_DATA. Nếu có, gộp dữ liệu DB với cấu trúc mặc định
        if (data.status === "empty") {
            window.NEST_DATA = deepClone(DEFAULT_DATA);
        } else {
            window.NEST_DATA = mergeDefaults(data);
        }
    } catch (e) {
        console.error("Lỗi lấy dữ liệu Database. Dùng tạm dữ liệu mặc định.", e);
        window.NEST_DATA = deepClone(DEFAULT_DATA);
    }
}

window.NEST_DEFAULT = DEFAULT_DATA;