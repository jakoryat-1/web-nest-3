/* =========================================================
   admin.js — NEST admin dashboard
   Đã nâng cấp Server-side Authentication & Data Sync
   ========================================================= */
var state = null;
var session = null;

/* ---------- helpers ---------- */
function $(s){ return document.querySelector(s); }
function vnd(n){ return new Intl.NumberFormat("vi-VN").format(Math.round(n||0)); }
function escHtml(s){ return String(s==null?"":s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c];}); }
function escAttr(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
function toast(m){ var t=$("#toast"); t.textContent=m; t.classList.add("show"); clearTimeout(t._t); t._t=setTimeout(function(){t.classList.remove("show");},2000); }
function fileToDataURL(f){ return new Promise(function(res){ var r=new FileReader(); r.onload=function(){res(r.result);}; r.readAsDataURL(f); }); }
function getPath(o,p){ return p.split(".").reduce(function(a,k){return a==null?undefined:a[k];},o); }
function setPath(o,p,v){ var ks=p.split("."),last=ks.pop(),t=ks.reduce(function(a,k){return a[k]=a[k]||{};},o); t[last]=v; }

/* ---------- LƯU DỮ LIỆU BẰNG API (DEBOUNCE) ---------- */
var saveTimeout = null;
function persist() {
    if (saveTimeout) clearTimeout(saveTimeout);
    var t = $("#toast");
    t.textContent = "Đang chờ lưu...";
    t.classList.add("show");

    saveTimeout = setTimeout(async function() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/save-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: state })
            });
            if (response.ok) {
                t.textContent = "Đã lưu đồng bộ lên Server ✓";
                setTimeout(() => t.classList.remove("show"), 2000);
            }
        } catch (error) {
            t.textContent = "Lỗi kết nối máy chủ ❌";
        }
    }, 1500); 
}

/* ---------- LOGIN BẰNG API ---------- */
async function doLogin(){
  var u=$("#admin-user").value.trim(), p=$("#admin-pass").value;
  try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      
      if(data.status === "success"){ 
          session = data.user; 
          sessionStorage.setItem("nest_admin_user", data.user.user); 
          showDashboard(); 
      } else {
          toast("Sai tên đăng nhập hoặc mật khẩu");
      }
  } catch(e) { toast("Lỗi kết nối Server Python"); }
}

function showDashboard(){
  $("#login-wrap").style.display="none";
  $("#admin-shell").style.display="flex";
  $("#who").innerHTML='<b>'+escHtml(session.name)+'</b>'+escHtml(session.role);
  renderAll();
}

$("#login-btn").addEventListener("click", doLogin);
$("#admin-pass").addEventListener("keydown", function(e){ if(e.key==="Enter") doLogin(); });
$("#logout-btn").addEventListener("click", function(){ sessionStorage.removeItem("nest_admin_user"); location.reload(); });

/* ---------- KHỞI TẠO DỮ LIỆU & AUTO LOGIN ---------- */
document.addEventListener("DOMContentLoaded", async function() {
    if (typeof fetchWebData === "function") await fetchWebData();
    state = window.NEST_DATA || JSON.parse(JSON.stringify(window.NEST_DEFAULT));

    var u = sessionStorage.getItem("nest_admin_user");
    if(u){ 
        var f = (state.users||[]).filter(function(x){return x.user===u;})[0]; 
        if(f){ session=f; showDashboard(); } 
    }
});

/* =========================================================
   ---------- PHẦN GIAO DIỆN (UI RENDERING) ----------
   ========================================================= */

var PANELS={
  overview:["Tổng quan","Tổng quan nhanh về quỹ và nội dung website."],
  content:["Nội dung trang","Sửa mọi chữ hiển thị trên các trang công khai."],
  fund:["Quỹ học bổng","Cập nhật số tiền quỹ và mục tiêu."],
  supporters:["Mạnh thường quân","Thêm/sửa/xoá nhà tài trợ theo từng hạng."],
  courses:["Khóa học","Quản lý các khóa học đang bán."],
  map:["Bản đồ","Tải ảnh bản đồ và quản lý các địa danh."],
  accounts:["Tài khoản admin","Quản lý các tài khoản đăng nhập quản trị."],
  data:["Dữ liệu / Bàn giao","Xuất/nhập dữ liệu để gửi cho lập trình viên."]
};

$("#admin-nav").addEventListener("click",function(e){
  var b=e.target.closest("button[data-panel]"); if(!b) return;
  document.querySelectorAll("#admin-nav button").forEach(function(x){x.classList.remove("active");});
  b.classList.add("active");
  var p=b.dataset.panel;
  document.querySelectorAll(".admin-panel").forEach(function(x){x.classList.remove("active");});
  $("#panel-"+p).classList.add("active");
  $("#panel-title").textContent=PANELS[p][0];
  $("#panel-desc").textContent=PANELS[p][1];
  $("#admin-side").classList.remove("open");
});

$("#burger-admin").addEventListener("click",function(){ $("#admin-side").classList.toggle("open"); });

function renderAll(){ renderOverview(); renderContent(); renderFund(); renderSupporters(); renderCourses(); renderMap(); renderAccounts(); renderDataPanel(); }

/* ===== OVERVIEW ===== */
function renderOverview(){
  var s=state.supporters, totSup=s.platinum.length+s.diamond.length+s.gold.length;
  var totC=state.courses.reduce(function(a,t){return a+t.items.length;},0);
  var pct=Math.min((state.fund.current/state.fund.goal)*100,100).toFixed(1);
  $("#panel-overview").innerHTML=
    '<div class="stat-grid">'+
      '<div class="stat"><div class="num">'+vnd(state.fund.current)+' ₫</div><div class="cap">Quỹ hiện tại ('+pct+'% mục tiêu)</div></div>'+
      '<div class="stat"><div class="num">'+totSup+'</div><div class="cap">Mạnh thường quân</div></div>'+
      '<div class="stat"><div class="num">'+totC+'</div><div class="cap">Khóa học</div></div>'+
      '<div class="stat"><div class="num">'+state.map.places.length+'</div><div class="cap">Địa danh trên bản đồ</div></div>'+
    '</div>'+
    '<div class="card"><h3>Xin chào, '+escHtml(session.name)+' 👋</h3>'+
      '<p class="help">Bạn đang đăng nhập với vai trò <span class="pill">'+escHtml(session.role)+'</span>. Mọi thay đổi được lưu ngay và hiển thị trên website.</p>'+
      '<div class="quick">'+
        '<a data-go="content"><span class="qi">📝</span><span><b>Nội dung trang</b><span>Sửa tiêu đề, đoạn văn, nút...</span></span></a>'+
        '<a data-go="fund"><span class="qi">💰</span><span><b>Quỹ học bổng</b><span>Cập nhật số tiền</span></span></a>'+
        '<a data-go="supporters"><span class="qi">🤝</span><span><b>Mạnh thường quân</b><span>Quản lý nhà tài trợ</span></span></a>'+
        '<a data-go="courses"><span class="qi">📚</span><span><b>Khóa học</b><span>Thêm/sửa khóa học</span></span></a>'+
        '<a data-go="map"><span class="qi">🗺️</span><span><b>Bản đồ</b><span>Ảnh & địa danh</span></span></a>'+
        '<a data-go="data"><span class="qi">💾</span><span><b>Bàn giao</b><span>Xuất dữ liệu JSON</span></span></a>'+
      '</div></div>';
  $("#panel-overview").querySelectorAll("[data-go]").forEach(function(a){
    a.addEventListener("click",function(){ document.querySelector('#admin-nav button[data-panel="'+a.dataset.go+'"]').click(); });
  });
}

/* ===== CONTENT ===== */
var PAGEN={index:"Trang chính (Landing)",courses:"Trang Khóa học",patrons:"Trang Mạnh thường quân",submit:"Trang Gửi khóa học"};
var LBL={
  heroPill:"Nhãn nhỏ phía trên (hero)",heroLine1:"Tiêu đề lớn — dòng 1",heroLine2:"Tiêu đề lớn — dòng 2 (tô màu)",
  heroLead:"Đoạn mô tả dưới tiêu đề",heroBtnPrimary:"Nút chính",heroBtnGhost:"Nút phụ",
  aboutEyebrow:"Giới thiệu — nhãn",aboutTitle:"Giới thiệu — tiêu đề",aboutSub:"Giới thiệu — mô tả",
  processEyebrow:"Mô hình — nhãn",processTitle:"Mô hình — tiêu đề",processSub:"Mô hình — mô tả",
  impactTitle:"Tác động — tiêu đề",
  ctaEyebrow:"Kêu gọi — nhãn",ctaTitle:"Kêu gọi — tiêu đề",ctaBtnPrimary:"Kêu gọi — nút chính",ctaBtnGhost:"Kêu gọi — nút phụ",
  listEyebrow:"Danh sách khóa — nhãn",listTitle:"Danh sách khóa — tiêu đề",listSub:"Danh sách khóa — mô tả",
  createEyebrow:"Tạo khóa học — nhãn",createTitle:"Tạo khóa học — tiêu đề",createSub:"Tạo khóa học — mô tả",createBtn:"Tạo khóa học — nút",
  fundLabel:"Nhãn đồng hồ quỹ",supEyebrow:"Mạnh thường quân — nhãn",supTitle:"Mạnh thường quân — tiêu đề",supSub:"Mạnh thường quân — mô tả",
  mapEyebrow:"Bản đồ — nhãn",mapTitle:"Bản đồ — tiêu đề",mapSub:"Bản đồ — mô tả",
  becomeEyebrow:"Trở thành MTQ — nhãn",becomeTitle:"Trở thành MTQ — tiêu đề",becomeSub:"Trở thành MTQ — mô tả",
  give1Title:"Bước 1 (góp quỹ) — tiêu đề",give1Desc:"Bước 1 (góp quỹ) — mô tả",
  give2Title:"Bước 2 (góp quỹ) — tiêu đề",give2Desc:"Bước 2 (góp quỹ) — mô tả",
  give3Title:"Bước 3 (góp quỹ) — tiêu đề",give3Desc:"Bước 3 (góp quỹ) — mô tả",
  bankInfo:"Thông tin tài khoản ngân hàng",
  step1Title:"Bước 1 — tiêu đề",step1Desc:"Bước 1 — mô tả",step2Title:"Bước 2 — tiêu đề",step2Desc:"Bước 2 — mô tả",
  step3Title:"Bước 3 — tiêu đề",step3Desc:"Bước 3 — mô tả",reassure:"Câu trấn an cuối trang"
};
var ARRAYS=[
  {key:"heroStats",title:"Số liệu nổi bật (trang chính, hero)",fields:[{k:"n",l:"Số"},{k:"c",l:"Nhãn"}],make:function(){return{n:"0",c:"Nhãn mới"};}},
  {key:"features",title:"Thẻ giới thiệu (trang chính)",fields:[{k:"ic",l:"Icon/emoji"},{k:"h",l:"Tiêu đề"},{k:"p",l:"Mô tả",t:1}],make:function(){return{ic:"🌱",h:"Tiêu đề",p:"Mô tả"};}},
  {key:"processSteps",title:"Bước trong 'Mô hình hoạt động' (dải chạy ngang)",fields:[{k:"num",l:"Số (01, 02...)"},{k:"h",l:"Tiêu đề"},{k:"p",l:"Mô tả",t:1}],make:function(){return{num:"04",h:"Bước mới",p:"Mô tả"};}},
  {key:"impactStats",title:"Số liệu 'Tác động'",fields:[{k:"n",l:"Số"},{k:"c",l:"Nhãn"}],make:function(){return{n:"0",c:"Nhãn mới"};}},
  {key:"whyFeatures",title:"Thẻ 'Vì sao học phí rẻ' (trang Khóa học)",fields:[{k:"ic",l:"Icon/emoji"},{k:"h",l:"Tiêu đề"},{k:"p",l:"Mô tả",t:1}],make:function(){return{ic:"💸",h:"Tiêu đề",p:"Mô tả"};}}
];

function renderContent(){
  var html="";
  ["index","courses","patrons","submit"].forEach(function(page){
    var obj=state.content[page]; if(!obj) return;
    html+='<div class="card"><h3>'+PAGEN[page]+'</h3><p class="help">Bấm vào ô và sửa trực tiếp — tự động lưu.</p>';
    Object.keys(obj).forEach(function(key){
      var val=obj[key], label=LBL[key]||key, path=page+"."+key, long=String(val).length>58;
      html+='<div class="field"><label>'+escHtml(label)+'</label>'+
        (long ? '<textarea data-content="'+path+'">'+escHtml(val)+'</textarea>'
              : '<input data-content="'+path+'" value="'+escAttr(val)+'">')+'</div>';
    });
    html+='</div>';
  });
  
  ARRAYS.forEach(function(cfg){
    var list=state.content[cfg.key]||[];
    html+='<div class="card"><h3>'+escHtml(cfg.title)+' <span class="pill">'+list.length+'</span></h3>';
    list.forEach(function(item,i){
      html+='<div class="row-item"><div class="row-head"><strong>#'+(i+1)+'</strong>'+
        '<button class="btn btn-danger btn-sm" data-arrdel="'+cfg.key+':'+i+'">Xoá</button></div><div class="grid3">';
      cfg.fields.forEach(function(f){
        var v=item[f.k], p=cfg.key+":"+i+":"+f.k;
        html+='<div class="field"><label>'+escHtml(f.l)+'</label>'+
          (f.t ? '<textarea data-arr="'+p+'">'+escHtml(v)+'</textarea>' : '<input data-arr="'+p+'" value="'+escAttr(v)+'">')+'</div>';
      });
      html+='</div></div>';
    });
    html+='<button class="btn btn-gold btn-sm" data-arradd="'+cfg.key+'">+ Thêm</button></div>';
  });
  $("#panel-content").innerHTML=html;

  $("#panel-content").querySelectorAll("[data-content]").forEach(function(inp){
    inp.addEventListener("input",function(){ setPath(state.content,inp.dataset.content,inp.value); persist(); });
  });
  $("#panel-content").querySelectorAll("[data-arr]").forEach(function(inp){
    inp.addEventListener("input",function(){ var pr=inp.dataset.arr.split(":"); state.content[pr[0]][+pr[1]][pr[2]]=inp.value; persist(); });
  });
  $("#panel-content").querySelectorAll("[data-arradd]").forEach(function(b){
    b.addEventListener("click",function(){ var cfg=ARRAYS.filter(function(a){return a.key===b.dataset.arradd;})[0]; state.content[b.dataset.arradd].push(cfg.make()); persist(); renderContent(); });
  });
  $("#panel-content").querySelectorAll("[data-arrdel]").forEach(function(b){
    b.addEventListener("click",function(){ var pr=b.dataset.arrdel.split(":"); state.content[pr[0]].splice(+pr[1],1); persist(); renderContent(); toast("Đã xoá"); });
  });
}

/* ===== FUND ===== */
function renderFund(){
  $("#panel-fund").innerHTML=
    '<div class="card" style="max-width:540px"><h3>Cập nhật quỹ</h3><p class="help">Nhập số tiền theo đồng (VND).</p>'+
    '<div class="field"><label>Tổng quỹ hiện tại (VND)</label><input type="number" id="f-current" value="'+state.fund.current+'"></div>'+
    '<div class="field"><label>Mục tiêu (VND)</label><input type="number" id="f-goal" value="'+state.fund.goal+'"></div>'+
    '<button class="btn btn-primary" id="f-save">Lưu</button>'+
    '<p class="help" id="f-prev" style="margin-top:14px">Xem trước: <b>'+vnd(state.fund.current)+' ₫</b> / '+vnd(state.fund.goal)+' ₫</p></div>';
  $("#f-save").addEventListener("click",function(){
    state.fund.current=+$("#f-current").value||0; state.fund.goal=+$("#f-goal").value||1;
    persist(); renderOverview(); $("#f-prev").innerHTML='Xem trước: <b>'+vnd(state.fund.current)+' ₫</b> / '+vnd(state.fund.goal)+' ₫'; toast("Đã lưu quỹ");
  });
}

/* ===== SUPPORTERS ===== */
var TIERL={platinum:"Bạch Kim · Platinum",diamond:"Kim Cương · Diamond",gold:"Vàng · Gold"};
function renderSupporters(){
  $("#panel-supporters").innerHTML=["platinum","diamond","gold"].map(function(tier){
    var rows=state.supporters[tier].map(function(s,i){
      return '<div class="row-item"><div class="row-head"><strong>'+escHtml(s.name||"(chưa đặt tên)")+'</strong>'+
        '<button class="btn btn-danger btn-sm" data-sdel="'+tier+':'+i+'">Xoá</button></div>'+
        '<div class="grid2"><div class="field"><label>Tên</label><input data-s="'+tier+':'+i+':name" value="'+escAttr(s.name)+'"></div>'+
        '<div class="field"><label>Lĩnh vực</label><input data-s="'+tier+':'+i+':field" value="'+escAttr(s.field)+'"></div></div>'+
        '<div class="grid2"><div class="field"><label>Logo (đường dẫn)</label><input data-s="'+tier+':'+i+':logo" value="'+escAttr(s.logo)+'" placeholder="images/..."></div>'+
        '<div class="field"><label>… hoặc tải logo</label><input type="file" accept="image/*" data-sfile="'+tier+':'+i+'"> '+(s.logo?'<img class="logo-prev" src="'+escAttr(s.logo)+'">':'')+'</div></div></div>';
    }).join("");
    return '<div class="card"><h3>'+TIERL[tier]+' <span class="pill">'+state.supporters[tier].length+'</span></h3>'+
      (rows||'<p class="help">Chưa có.</p>')+'<button class="btn btn-gold btn-sm" data-sadd="'+tier+'">+ Thêm nhà tài trợ</button></div>';
  }).join("");
  var root=$("#panel-supporters");
  root.querySelectorAll("[data-s]").forEach(function(inp){ inp.addEventListener("input",function(){ var p=inp.dataset.s.split(":"); state.supporters[p[0]][+p[1]][p[2]]=inp.value; persist(); }); });
  root.querySelectorAll("[data-sfile]").forEach(function(inp){ inp.addEventListener("change",async function(){ if(!inp.files[0])return; var p=inp.dataset.sfile.split(":"); state.supporters[p[0]][+p[1]].logo=await fileToDataURL(inp.files[0]); persist(); renderSupporters(); toast("Đã tải logo"); }); });
  root.querySelectorAll("[data-sadd]").forEach(function(b){ b.addEventListener("click",function(){ state.supporters[b.dataset.sadd].push({name:"Tên nhà tài trợ",field:"Lĩnh vực",logo:""}); persist(); renderSupporters(); renderOverview(); }); });
  root.querySelectorAll("[data-sdel]").forEach(function(b){ b.addEventListener("click",function(){ var p=b.dataset.sdel.split(":"); state.supporters[p[0]].splice(+p[1],1); persist(); renderSupporters(); renderOverview(); toast("Đã xoá"); }); });
}

/* ===== COURSES ===== */
function renderCourses(){
  $("#panel-courses").innerHTML=state.courses.map(function(track,ti){
    var items=track.items.map(function(c,ci){
      return '<div class="row-item"><div class="row-head"><strong>'+escHtml(c.title||"(khóa mới)")+'</strong>'+
        '<button class="btn btn-danger btn-sm" data-cdel="'+ti+':'+ci+'">Xoá</button></div>'+
        '<div class="grid2"><div class="field"><label>Tên khóa</label><input data-c="'+ti+':'+ci+':title" value="'+escAttr(c.title)+'"></div>'+
        '<div class="field"><label>Trình độ</label><input data-c="'+ti+':'+ci+':level" value="'+escAttr(c.level)+'"></div></div>'+
        '<div class="field"><label>Mô tả</label><textarea data-c="'+ti+':'+ci+':desc">'+escHtml(c.desc)+'</textarea></div>'+
        '<div class="grid3"><div class="field"><label>Số tuần</label><input type="number" data-c="'+ti+':'+ci+':weeks" value="'+c.weeks+'"></div>'+
        '<div class="field"><label>Số bài</label><input type="number" data-c="'+ti+':'+ci+':lessons" value="'+c.lessons+'"></div>'+
        '<div class="field"><label>Đánh giá (0-5)</label><input type="number" step="0.1" max="5" data-c="'+ti+':'+ci+':rating" value="'+c.rating+'"></div></div>'+
        '<div class="field"><label>Học phí (VND, 0 = miễn phí)</label><input type="number" data-c="'+ti+':'+ci+':price" value="'+c.price+'"></div></div>';
    }).join("");
    return '<div class="card"><h3>📂 Nhóm: <input data-t="'+ti+':track" value="'+escAttr(track.track)+'" style="display:inline-block;width:auto;min-width:200px"></h3>'+
      '<div class="field"><label>Mô tả nhóm</label><input data-t="'+ti+':sub" value="'+escAttr(track.sub)+'"></div>'+items+
      '<button class="btn btn-gold btn-sm" data-cadd="'+ti+'">+ Thêm khóa học</button> <button class="btn btn-danger btn-sm" data-tdel="'+ti+'">Xoá nhóm</button></div>';
  }).join("")+'<button class="btn btn-primary btn-sm" id="add-track">+ Thêm nhóm khóa học</button>';
  var root=$("#panel-courses");
  root.querySelectorAll("[data-c]").forEach(function(inp){ inp.addEventListener("input",function(){ var p=inp.dataset.c.split(":"),v=inp.value; if(["weeks","lessons","rating","price"].indexOf(p[2])>=0)v=+v||0; state.courses[+p[0]].items[+p[1]][p[2]]=v; persist(); }); });
  root.querySelectorAll("[data-t]").forEach(function(inp){ inp.addEventListener("input",function(){ var p=inp.dataset.t.split(":"); state.courses[+p[0]][p[1]]=inp.value; persist(); }); });
  root.querySelectorAll("[data-cadd]").forEach(function(b){ b.addEventListener("click",function(){ state.courses[+b.dataset.cadd].items.push({title:"Khóa học mới",level:"Cơ bản",desc:"Mô tả.",weeks:8,lessons:20,rating:5,price:490000,image:""}); persist(); renderCourses(); renderOverview(); }); });
  root.querySelectorAll("[data-cdel]").forEach(function(b){ b.addEventListener("click",function(){ var p=b.dataset.cdel.split(":"); state.courses[+p[0]].items.splice(+p[1],1); persist(); renderCourses(); renderOverview(); toast("Đã xoá"); }); });
  root.querySelectorAll("[data-tdel]").forEach(function(b){ b.addEventListener("click",function(){ state.courses.splice(+b.dataset.tdel,1); persist(); renderCourses(); renderOverview(); }); });
  $("#add-track").addEventListener("click",function(){ state.courses.push({track:"Nhóm mới",sub:"Mô tả nhóm.",items:[]}); persist(); renderCourses(); });
}

/* ===== MAP ===== */
function renderMap(){
  var places=state.map.places.map(function(p,i){
    return '<div class="row-item"><div class="row-head"><strong>#'+(i+1)+' · '+escHtml(p.name||"(mới)")+'</strong>'+
      '<button class="btn btn-danger btn-sm" data-pdel="'+i+'">Xoá</button></div>'+
      '<div class="grid2"><div class="field"><label>Tên địa danh</label><input data-p="'+i+':name" value="'+escAttr(p.name)+'"></div>'+
      '<div class="field"><label>Phân loại</label><input data-p="'+i+':category" value="'+escAttr(p.category)+'"></div></div>'+
      '<div class="grid3"><div class="field"><label>Toạ độ X (%)</label><input type="number" data-p="'+i+':x" value="'+p.x+'"></div>'+
      '<div class="field"><label>Toạ độ Y (%)</label><input type="number" data-p="'+i+':y" value="'+p.y+'"></div>'+
      '<div class="field"><label>Số sao (1-5)</label><input type="number" step="0.5" max="5" data-p="'+i+':rating" value="'+p.rating+'"></div></div>'+
      '<div class="field"><label>Mô tả</label><textarea data-p="'+i+':description">'+escHtml(p.description)+'</textarea></div>'+
      '<div class="field"><label>Lịch sử</label><textarea data-p="'+i+':history">'+escHtml(p.history)+'</textarea></div>'+
      '<div class="grid2"><div class="field"><label>Ảnh (đường dẫn)</label><input data-p="'+i+':image" value="'+escAttr(p.image)+'" placeholder="images/..."></div>'+
      '<div class="field"><label>… hoặc tải ảnh</label><input type="file" accept="image/*" data-pfile="'+i+'"> '+(p.image?'<img class="logo-prev" src="'+escAttr(p.image)+'">':'')+'</div></div></div>';
  }).join("");
  $("#panel-map").innerHTML=
    '<div class="card"><h3>Ảnh bản đồ</h3><p class="help">Tải ảnh bản đồ làm nền cho các chấm địa danh.</p>'+
    '<div class="grid2"><div class="field"><label>Đường dẫn ảnh</label><input id="map-img-path" value="'+escAttr(state.map.image)+'" placeholder="images/map.jpg"></div>'+
    '<div class="field"><label>… hoặc tải ảnh bản đồ</label><input type="file" accept="image/*" id="map-img-file"></div></div>'+
    (state.map.image?'<img src="'+escAttr(state.map.image)+'" style="max-height:220px;border:1px solid var(--line);border-radius:12px">':'<span class="pill">Chưa có ảnh</span>')+'</div>'+
    '<div class="card"><h3>Địa danh <span class="pill">'+state.map.places.length+'</span></h3>'+
    '<p class="help">Mẹo: mở <a href="patrons.html#map-section" target="_blank">bản đồ</a>, di chuột để lấy toạ độ X/Y (%).</p>'+
    (places||'<p class="help">Chưa có địa danh.</p>')+'<button class="btn btn-gold btn-sm" id="add-place">+ Thêm địa danh</button></div>';
  var root=$("#panel-map");
  $("#map-img-path").addEventListener("input",function(e){ state.map.image=e.target.value; persist(); });
  $("#map-img-file").addEventListener("change",async function(e){ if(!e.target.files[0])return; state.map.image=await fileToDataURL(e.target.files[0]); persist(); renderMap(); toast("Đã tải ảnh bản đồ"); });
  root.querySelectorAll("[data-p]").forEach(function(inp){ inp.addEventListener("input",function(){ var pr=inp.dataset.p.split(":"),v=inp.value; if(["x","y","rating"].indexOf(pr[1])>=0)v=+v||0; state.map.places[+pr[0]][pr[1]]=v; persist(); }); });
  root.querySelectorAll("[data-pfile]").forEach(function(inp){ inp.addEventListener("change",async function(){ if(!inp.files[0])return; state.map.places[+inp.dataset.pfile].image=await fileToDataURL(inp.files[0]); persist(); renderMap(); toast("Đã tải ảnh"); }); });
  root.querySelectorAll("[data-pdel]").forEach(function(b){ b.addEventListener("click",function(){ state.map.places.splice(+b.dataset.pdel,1); persist(); renderMap(); renderOverview(); toast("Đã xoá"); }); });
  $("#add-place").addEventListener("click",function(){ state.map.places.push({x:50,y:50,name:"Địa danh mới",category:"Điểm đến",image:"",description:"Mô tả.",history:"Lịch sử.",rating:5}); persist(); renderMap(); renderOverview(); });
}

/* ===== ACCOUNTS ===== */
function renderAccounts(){
  var rows=state.users.map(function(u,i){
    return '<div class="row-item"><div class="row-head"><strong>'+escHtml(u.name)+' — '+escHtml(u.role)+'</strong>'+
      '<button class="btn btn-danger btn-sm" data-udel="'+i+'">Xoá</button></div>'+
      '<div class="grid2"><div class="field"><label>Họ tên</label><input data-u="'+i+':name" value="'+escAttr(u.name)+'"></div>'+
      '<div class="field"><label>Vai trò</label><input data-u="'+i+':role" value="'+escAttr(u.role)+'"></div></div>'+
      '<div class="grid2"><div class="field"><label>Tên đăng nhập</label><input data-u="'+i+':user" value="'+escAttr(u.user)+'"></div>'+
      '<div class="field"><label>Mật khẩu</label><input data-u="'+i+':pass" value="'+escAttr(u.pass)+'"></div></div></div>';
  }).join("");
  $("#panel-accounts").innerHTML=
    '<div class="card"><h3>Tài khoản quản trị <span class="pill">'+state.users.length+'</span></h3>'+
    '<p class="help">Mật khẩu giờ đã được quản lý bởi Python Server.</p>'+rows+
    '<button class="btn btn-gold btn-sm" id="add-user">+ Thêm tài khoản</button></div>';
  var root=$("#panel-accounts");
  root.querySelectorAll("[data-u]").forEach(function(inp){ inp.addEventListener("input",function(){ var p=inp.dataset.u.split(":"); state.users[+p[0]][p[1]]=inp.value; persist(); }); });
  root.querySelectorAll("[data-udel]").forEach(function(b){ b.addEventListener("click",function(){ if(state.users.length<=1){toast("Cần ít nhất 1 tài khoản");return;} state.users.splice(+b.dataset.udel,1); persist(); renderAccounts(); toast("Đã xoá"); }); });
  $("#add-user").addEventListener("click",function(){ state.users.push({user:"user"+(state.users.length+1),pass:"doimatkhau",name:"Người dùng mới",role:"Quản trị"}); persist(); renderAccounts(); });
}

/* ===== DATA ===== */
function renderDataPanel(){
  $("#panel-data").innerHTML=
    '<div class="card"><h3>Gửi cho lập trình viên</h3>'+
    '<p class="help">Xuất toàn bộ nội dung thành JSON để sao lưu.</p>'+
    '<div class="toolbar"><button class="btn btn-primary" id="export-json">⬇️ Xuất dữ liệu (JSON)</button>'+
    '<label class="btn btn-gold" style="cursor:pointer">⬆️ Nhập dữ liệu (JSON)<input type="file" id="import-json" accept="application/json" hidden></label>'+
    '<button class="btn btn-danger" id="reset-data">↺ Khôi phục mặc định</button></div>'+
    '<div class="field"><label>Xem trước JSON</label><textarea id="json-view" style="min-height:240px;font-family:monospace;font-size:.8rem" readonly>'+escHtml(JSON.stringify(state,null,2))+'</textarea></div></div>';
  
  $("#export-json").addEventListener("click",function(){
    var blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="nest-data-backup.json"; a.click(); toast("Đã xuất JSON");
  });
  
  $("#import-json").addEventListener("change",async function(e){ 
      if(!e.target.files[0])return; 
      try{ 
          state=JSON.parse(await e.target.files[0].text()); 
          persist(); renderAll(); toast("Đã nhập dữ liệu"); 
      }catch(x){ toast("Tệp JSON không hợp lệ"); } 
  });
  
  // Nút khôi phục đã được sửa để tương thích với Server-side
  $("#reset-data").addEventListener("click",function(){ 
      if(confirm("Khôi phục toàn bộ về mặc định? Thay đổi hiện tại sẽ mất.")){ 
          state = JSON.parse(JSON.stringify(window.NEST_DEFAULT)); 
          persist(); 
          renderAll(); 
          toast("Đã khôi phục"); 
      } 
  });
}