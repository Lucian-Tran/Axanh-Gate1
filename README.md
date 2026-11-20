# AXANH Gate1 – Phiên Chợ Tri Thức / ATED PRO 2026

Hệ thống kết nối và trao đổi tri thức nội bộ AXANH, tích hợp Lark Base OpenAPI, xác thực Email OTP và hỗ trợ điều kiện Quán quân Gate 1.

---

## 🛑 HƯỚNG DẪN TẮT FRONTEND VÀ BACKEND

Khi cần dừng máy chủ Backend (Port `3100`) và Frontend (Port `5173`), bạn có thể sử dụng các cách sau:

### Cách 1: Dừng trực tiếp trong cửa sổ Terminal / PowerShell (Phổ biến nhất)

Nếu bạn đang chạy server trên cửa sổ dòng lệnh riêng:
- Nhấp chuột vào cửa sổ đang chạy server.
- Nhấn tổ hợp phím: **`Ctrl + C`**
- Nếu hệ thống hỏi `Terminate batch job (Y/N)?`, gõ **`Y`** và nhấn **`Enter`**.
- Lặp lại cho cả 2 cửa sổ terminal của Backend và Frontend.

---

### Cách 2: Tắt nhanh bằng lệnh PowerShell (Khi server chạy ngầm hoặc bị kẹt cổng)

Mở một cửa sổ **PowerShell** và chạy các lệnh tương ứng:

#### 1. Tắt cả Backend (Port 3100) và Frontend (Port 5173) cùng lúc:
```powershell
Get-NetTCPConnection -LocalPort 3100, 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### 2. Chỉ tắt Backend (Port 3100):
```powershell
Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### 3. Chỉ tắt Frontend (Port 5173):
```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

#### 4. Hoặc tắt toàn bộ tiến trình Node.js đang chạy trên máy:
```powershell
Stop-Process -Name node -Force
```

---

### Cách 3: Ra lệnh cho Antigravity Assistant

Nếu bạn đang thao tác trong giao diện chat với Antigravity, bạn chỉ cần gõ:
> *"tắt backend và frontend đang chạy"*

Trợ lý sẽ tự động kiểm tra background tasks và tiến trình cổng mạng để tắt an toàn cho bạn.

---

## 🚀 HƯỚNG DẪN KHỞI ĐỘNG HỆ THỐNG

### 1. Khởi động Backend (Port 3100)
```powershell
cd "BackEnd"
npm start
```
*Backend chạy tại:* `http://127.0.0.1:3100`

### 2. Khởi động Frontend (Port 5173)
```powershell
cd "FrontEnd"
npm run dev
```
*Frontend chạy tại:* `http://localhost:5173` (hoặc mạng nội bộ: `http://192.168.1.60:5173`)

---

## 🧪 CHẠY KIỂM THỬ TỰ ĐỘNG (TEST SUITE)

Để chạy toàn bộ bài test (Email OTP, Booths CRUD, Smart Matching, Lark SSO, Image Service, Lịch cùng học và Form 02):
```powershell
cd "BackEnd"
npm test
```

---

## 📁 CẤU TRÚC THƯ MỤC CHÍNH

```text
Axanh-Gate1/
├── BackEnd/
│   ├── src/
│   │   ├── config.js               # Đọc và xác thực cấu hình môi trường (.env)
│   │   ├── lark-client.js          # Kết nối Lark Base OpenAPI
│   │   ├── mappers.js              # Ánh xạ dữ liệu Làng, Thành viên, Gian hàng
│   │   ├── matching-scoring.js     # Thuật toán tính điểm Smart Matching (0-100)
│   │   ├── matching-service.js     # Dịch vụ Matching, phân quyền RBAC Admin/User
│   │   ├── auth-store.js           # Lưu trữ SQLite (Session, OTP, Booths)
│   │   ├── email-service.js        # Gửi mã OTP qua SMTP
│   │   ├── learning-service.js     # Lịch T15 và báo cáo Form 02 có phân quyền
│   │   └── server.js               # Node.js HTTP Server & REST API endpoints
│   ├── test/                       # 59 automated test cases
│   └── .env                        # Biến môi trường máy chủ
│
├── FrontEnd/
│   ├── api.js                      # Client API kết nối Backend
│   ├── app.js                      # Logic giao diện người dùng chính
│   ├── index.html                  # Giao diện chính AXANH Gate1
│   ├── style.css                   # Thiết kế giao diện & responsive styles
│   └── vite.config.js              # Cấu hình máy chủ Vite Dev Server
└── README.md                       # Tài liệu hướng dẫn sử dụng
```

