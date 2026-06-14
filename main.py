# Cài đặt thư viện trước khi chạy: pip install fastapi uvicorn pydantic
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import json
import os
import uvicorn



app = FastAPI()

# Mở luồng cho Frontend gọi API không bị lỗi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kết nối SQLite (Tự động tạo file nest_data.db nếu chưa có)
conn = sqlite3.connect('nest_data.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS web_settings (
        id INTEGER PRIMARY KEY,
        data_json TEXT NOT NULL
    )
''')
conn.commit()

# Khởi tạo dữ liệu mặc định nếu DB trống
cursor.execute("SELECT data_json FROM web_settings WHERE id = 1")
if not cursor.fetchone():
    cursor.execute("INSERT INTO web_settings (id, data_json) VALUES (1, '{}')")
    conn.commit()

# ====================================================
# BỘ NHỚ ĐỆM (RAM CACHE) - GIÚP TĂNG TỐC ĐỘ GẤP 100 LẦN
# ====================================================
memory_cache = {"data": None}

# ====================================================
# KHAI BÁO CÁC CLASS (MODEL) Ở ĐÂY TRƯỚC KHI DÙNG
# ====================================================
class WebData(BaseModel):
    data: dict

class LoginData(BaseModel):
    username: str
    password: str

# ====================================================
# KHAI BÁO CÁC API
# ====================================================

# 1. API Đọc dữ liệu (Cho Frontend trang chủ) - Đã có CACHE
@app.get("/api/get-data")
def get_data():
    # Bước 1: Kiểm tra trong RAM (Cache) trước, có thì trả về NGAY LẬP TỨC
    if memory_cache["data"] is not None:
        return memory_cache["data"]
        
    # Bước 2: Nếu RAM trống, lúc này mới vào Database để lấy
    cursor.execute("SELECT data_json FROM web_settings WHERE id = 1")
    row = cursor.fetchone()
    
    if row and row[0] != '{}':
        data = json.loads(row[0])
        # Lưu vào RAM để lần sau khách vào web không cần gọi Database nữa
        memory_cache["data"] = data 
        return data
        
    return {"status": "empty"}

# 2. API Xử lý đăng nhập
@app.post("/api/login")
def login(credentials: LoginData):
    cursor.execute("SELECT data_json FROM web_settings WHERE id = 1")
    row = cursor.fetchone()
    
    users = []
    if row and row[0] != '{}':
        db_data = json.loads(row[0])
        users = db_data.get("users", [])
        
    # Nếu DB trống không có user nào, dùng tạm 3 tài khoản mặc định để vào được Admin
    if not users:
        users = [
            {"user": "devlead", "pass": "nest-dev-2026", "name": "Lập trình viên trưởng", "role": "Lead Developer"},
            {"user": "ceo", "pass": "nest-ceo-2026", "name": "Giám đốc điều hành", "role": "CEO"},
            {"user": "cfo", "pass": "nest-cfo-2026", "name": "Giám đốc tài chính", "role": "CFO"}
        ]
            
    # Kiểm tra tài khoản và mật khẩu
    for u in users:
        if u["user"] == credentials.username and u["pass"] == credentials.password:
            return {"status": "success", "user": u}
            
    return {"status": "error", "message": "Sai thông tin đăng nhập"}

# 3. API Lưu dữ liệu (Cho Admin Dashboard) - Cập nhật DB lẫn CACHE
@app.post("/api/save-data")
def save_data(payload: WebData):
    json_string = json.dumps(payload.data)
    
    # Lưu vào ổ cứng (Database)
    cursor.execute("UPDATE web_settings SET data_json = ? WHERE id = 1", (json_string,))
    conn.commit()
    
    # RẤT QUAN TRỌNG: Cập nhật luôn dữ liệu mới vào RAM (Cache)
    # Nhờ vậy, người bên ngoài F5 lại trang sẽ thấy cập nhật ngay
    memory_cache["data"] = payload.data
    
    return {"message": "Đã lưu thành công vào Database và cập nhật Cache!"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)