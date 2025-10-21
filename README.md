# CNPM Frontend - Smart School Bus System

## 📋 Mô tả dự án

**Smart School Bus System Frontend** là giao diện người dùng cho hệ thống quản lý và theo dõi xe buýt học đường thông minh. Ứng dụng được xây dựng với React, cung cấp giao diện trực quan cho 3 loại người dùng: Quản lý, Tài xế và Phụ huynh.

## 🎯 Yêu cầu hệ thống

### Yêu cầu chức năng

#### 1. Hệ thống xác thực và phân quyền
- **Đăng nhập**: Hỗ trợ đăng nhập cho 3 vai trò
- **Phân quyền động**: Menu và chức năng hiển thị theo vai trò
- **Bảo vệ routes**: Chỉ cho phép truy cập các trang được phép
- **Quản lý session**: Lưu trữ thông tin user trong localStorage

#### 2. Dashboard Quản lý (Admin)

##### 2.1 Quản lý học sinh
- Xem danh sách học sinh với tìm kiếm
- Thêm học sinh mới (modal form)
- Chỉnh sửa thông tin học sinh
- Xóa học sinh
- Liên kết với phụ huynh
- Hiển thị thông tin: Mã HS, Họ tên, Lớp, Phụ huynh, Ghi chú

##### 2.2 Quản lý phụ huynh
- Xem danh sách phụ huynh
- Thêm phụ huynh mới
- Tìm kiếm theo tên
- Xem danh sách con của mỗi phụ huynh
- Hiển thị: ID, Họ tên, Email, SĐT

##### 2.3 Quản lý tài xế
- Danh sách tài xế với tìm kiếm
- Thêm tài xế mới
- Xem lịch trình của tài xế
- Theo dõi trạng thái: Đang hoạt động/Tạm nghỉ
- Hiển thị xe phụ trách

##### 2.4 Quản lý xe buýt
- Danh sách xe với tìm kiếm
- Thêm xe mới
- Thông tin: Biển số, Số ghế, Mẫu xe, Tài xế hiện tại
- Chỉnh sửa và xóa xe

##### 2.5 Quản lý tuyến đường
- Tạo tuyến đường mới
- Thêm điểm dừng vào tuyến
- Sắp xếp thứ tự điểm dừng (drag & drop)
- Preview tuyến đường trên bản đồ
- Xem chi tiết tuyến

##### 2.6 Quản lý trạm dừng
- Danh sách trạm với tìm kiếm
- Thêm trạm mới với tọa độ GPS
- Chọn vị trí trên bản đồ tương tác (Goong Maps)
- Hiển thị: Tên trạm, Địa chỉ, Vị trí
- Preview vị trí trên map

##### 2.7 Quản lý lịch trình
- Lịch theo tuần (calendar view)
- Tạo lịch trình mới
- Phân công xe buýt và tài xế
- Chọn tuyến đường
- Chọn học sinh cho chuyến đi
- Chỉnh sửa và xóa lịch trình
- Xem chi tiết lịch trình (modal)

##### 2.8 Theo dõi xe buýt (Real-time)
- Bản đồ hiển thị vị trí tất cả xe
- Lọc theo tuyến đường
- Hiển thị tuyến đường và điểm dừng
- Thông tin xe: Biển số, Tài xế, Số học sinh

##### 2.9 Gửi thông báo
- Gửi thông báo đến phụ huynh
- Chọn đối tượng: Tất cả/Theo tuyến/Cá nhân
- Soạn tiêu đề và nội dung
- Lịch sử thông báo đã gửi

##### 2.10 Quản lý tài khoản
- Danh sách tất cả tài khoản
- Thêm tài khoản mới
- Phân quyền: Quản lý/Phụ huynh/Tài xế
- Chỉnh sửa thông tin
- Đổi mật khẩu
- Tìm kiếm và lọc theo vai trò

##### 2.11 Dashboard
- Thống kê tổng quan
- Biểu đồ và số liệu
- Hoạt động gần đây

#### 3. Giao diện Tài xế (Driver)

##### 3.1 Điểm danh học sinh
- Xem chuyến đi hiện tại
- Danh sách điểm dừng và học sinh
- Điểm danh từng học sinh:
  - ✅ Đã đón
  - ❌ Vắng mặt
  - 🔄 Chờ điểm danh
- Ghi chú cho mỗi học sinh

##### 3.2 Xem lịch trình
- Lịch tuần dạng calendar
- Chi tiết chuyến đi:
  - Giờ khởi hành
  - Tên tuyến
  - Biển số xe
  - Số học sinh
- Chỉ xem, không chỉnh sửa

##### 3.3 Bản đồ tuyến
- Xem tuyến đường được phân công
- Hiển thị điểm dừng
- Directions từ điểm này sang điểm khác

##### 3.4 Thông báo & Cảnh báo
- Nhận thông báo từ quản lý
- Gửi cảnh báo khi có sự cố
- Thông báo về học sinh

#### 4. Giao diện Phụ huynh (Parent)

##### 4.1 Theo dõi xe của con
- Bản đồ real-time
- Vị trí xe buýt của con
- Điểm đón/trả của con
- Vị trí trường học
- Thông tin tài xế và xe
- Ước tính thời gian đến

##### 4.2 Hộp thư thông báo
- Danh sách thông báo
- Lọc theo loại: Chuyến đi/Cảnh báo/Hệ thống
- Đánh dấu đã đọc/chưa đọc
- Chi tiết thông báo

##### 4.3 Thông tin cá nhân
- Thông tin phụ huynh
- Danh sách con
- Thông tin mỗi con:
  - Họ tên, lớp, ngày sinh
  - Điểm đón/trả
  - Tuyến đường
  - Xe buýt và tài xế
  - Trạng thái: Đang học/Nghỉ học

### Yêu cầu phi chức năng

#### 1. Giao diện người dùng (UI/UX)
- **Responsive Design**: Hoạt động tốt trên desktop, tablet, mobile
- **Accessibility**: Dễ sử dụng, màu sắc phù hợp
- **Performance**: Load time < 3s
- **Animation**: Transitions mượt mà
- **Feedback**: Loading states, success/error messages

#### 2. Tương tác với bản đồ
- **Goong Maps Integration**: Bản đồ Việt Nam chính xác
- **Markers**: Hiển thị xe buýt, điểm dừng, trường học
- **Directions**: Vẽ tuyến đường
- **Interactive**: Click, zoom, pan

#### 3. Quản lý trạng thái
- **Local State**: useState, useEffect
- **Global State**: User info trong localStorage
- **Form State**: Controlled components

#### 4. Security
- **Protected Routes**: Kiểm tra authentication
- **Role-based Access**: Hiển thị theo vai trò
- **Input Validation**: Client-side validation
- **XSS Prevention**: Sanitize user input

## 🏗️ Kiến trúc hệ thống

### Kiến trúc tổng quan

```
┌───────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
│                     (React Components)                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    PAGES                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │    Admin     │  │   Driver     │  │   Parent     │   │  │
│  │  │              │  │              │  │              │   │  │
│  │  │ - Dashboard  │  │ - DiemDanh   │  │ - TheoDoi    │   │  │
│  │  │ - QuanLyHS   │  │ - XemLichTrinh│  │ - ThongBao  │   │  │
│  │  │ - QuanLyPH   │  │              │  │ - ThongTin   │   │  │
│  │  │ - QuanLyTX   │  │              │  │              │   │  │
│  │  │ - QuanLyXe   │  │              │  │              │   │  │
│  │  │ - QuanLyTuyen│  │              │  │              │   │  │
│  │  │ - QuanLyTram │  │              │  │              │   │  │
│  │  │ - LichTrinh  │  │              │  │              │   │  │
│  │  │ - GuiThongBao│  │              │  │              │   │  │
│  │  │ - TaiKhoan   │  │              │  │              │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                            ▲                                  │
│                            │ uses                             │
│  ┌─────────────────────────┴───────────────────────────────┐  │
│  │                   COMPONENTS                            │  │
│  │  - Layout (Sidebar + Header)                            │  │
│  │  - Modals (Student, Bus, Driver, Route, Stop, etc.)     │  │
│  │  - MapComponent (Goong Maps wrapper)                    │  │
│  │  - Card, Form elements                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                            │
                            │ API calls
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                            │
├───────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    SERVICES                             │  │
│  │  - apiClient.jsx      (Axios instance)                  │  │
│  │  - authService.jsx    (Login, Register)                 │  │
│  │  - goongApi.jsx       (Map API integration)             │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTP Requests
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                      BACKEND API                              │
│                  (Express.js REST API)                        │
└───────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App.jsx (Root)
├── Router
│   ├── Public Routes
│   │   └── /login → DangNhap.jsx
│   │
│   └── Protected Routes (wrapped in Layout.jsx)
│       ├── Layout.jsx (Sidebar + Header + Outlet)
│       │   ├── Sidebar (dynamic menu based on role)
│       │   ├── Header (page title)
│       │   └── Main Content (Outlet)
│       │
│       ├── Admin Routes (role: quan_ly)
│       │   ├── /dashboard → Dashboard.jsx
│       │   ├── /hocsinh → QuanLyHocSinh.jsx
│       │   │   └── uses: StudentModal.jsx
│       │   ├── /phuhuynh → QuanLyPhuHuynh.jsx
│       │   │   └── uses: ParentModal.jsx
│       │   ├── /taixe → QuanLyTaiXe.jsx
│       │   │   └── uses: DriverModal.jsx
│       │   ├── /xebuyt → QuanLyXeBus.jsx
│       │   │   └── uses: BusModal.jsx
│       │   ├── /tuyenduong → QuanLyTuyenDuong.jsx
│       │   │   └── uses: RouteModal.jsx
│       │   ├── /tram → QuanLyTram.jsx
│       │   │   └── uses: StopModal.jsx, MapComponent.jsx
│       │   ├── /lichtrinh → QuanLyLichTrinh.jsx
│       │   │   └── uses: ScheduleModal.jsx, ScheduleDetailModal.jsx
│       │   ├── /guithongbaoph → GuiThongBao.jsx
│       │   └── /taikhoan → QuanLyTaiKhoan.jsx
│       │       └── uses: EditAccountModal.jsx, ChangePasswordModal.jsx
│       │
│       ├── Driver Routes (role: tai_xe)
│       │   ├── /diemdanh → DiemDanhHocSinh.jsx
│       │   ├── /lichtrinh → XemLichTrinh.jsx
│       │   │   └── uses: ScheduleDetailModal.jsx
│       │   ├── /theodoixe → TheoDoiXeBuyt.jsx
│       │   │   └── uses: MapComponent.jsx
│       │   └── /thongbao → ThongBao.jsx
│       │
│       ├── Parent Routes (role: phu_huynh)
│       │   ├── /theodoixe → TheoDoiXeBuyt.jsx
│       │   │   └── uses: MapComponent.jsx
│       │   ├── /thongbao → ThongBao.jsx
│       │   └── /thongtinphuhuynh → ThongTinPhuHuynh.jsx
│       │
│       └── Common Routes (all roles)
│           └── /thongbao → ThongBao.jsx

Shared Components:
├── Layout.jsx (Main layout with sidebar)
├── MapComponent.jsx (Goong Maps wrapper)
└── Modals/
    ├── StudentModal.jsx
    ├── ParentModal.jsx
    ├── DriverModal.jsx
    ├── BusModal.jsx
    ├── RouteModal.jsx
    ├── StopModal.jsx
    ├── ScheduleModal.jsx
    ├── ScheduleDetailModal.jsx
    ├── EditAccountModal.jsx
    ├── ChangePasswordModal.jsx
    └── AccountModal.jsx
```

### State Management

```
┌─────────────────────────────────────────────────────────┐
│                  STATE MANAGEMENT                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Global State (App.jsx)                                 │
│  ├── currentUser (useState)                             │
│  │   - Stored in localStorage                           │
│  │   - Contains: id, ho_ten, vai_tro, etc.              │
│  │                                                      │
│  └── Functions:                                         │
│      ├── handleLoginSuccess(userData)                   │
│      └── handleLogout()                                 │
│                                                         │
│  Local State (per component)                            │
│  ├── Data Lists: [students, buses, routes, etc.]        │
│  ├── UI State: [isModalOpen, selectedItem, loading]     │
│  ├── Form State: [formData, errors]                     │
│  └── Filter State: [searchTerm, selectedFilter]         │
│                                                         │
│  Derived State (useMemo)                                │
│  ├── filteredData = useMemo(() => ...)                  │
│  └── menuItems = useMemo(() => ..., [user.vai_tro])     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Routing & Navigation

```
React Router v6 + Role-based Access Control

Public Routes:
└── /login (DangNhap.jsx)

Protected Routes (requires authentication):
├── / → DefaultPageBasedOnRole
├── Admin Routes (vai_tro === 'quan_ly')
│   ├── /dashboard
│   ├── /hocsinh
│   ├── /taixe
│   ├── /xebuyt
│   ├── /tuyenduong
│   ├── /tram
│   ├── /lichtrinh
│   ├── /theodoixe
│   ├── /guithongbaoph
│   └── /taikhoan
│
├── Driver Routes (vai_tro === 'tai_xe')
│   ├── /diemdanh
│   ├── /lichtrinh
│   ├── /theodoixe
│   └── /thongbao
│
└── Parent Routes (vai_tro === 'phu_huynh')
    ├── /theodoixe
    ├── /thongbao
    └── /thongtinphuhuynh

Route Protection:
- ProtectedRoute component checks currentUser
- If not authenticated → redirect to /login
- If authenticated but wrong role → redirect based on role
```

## 🗺️ Thiết kế UI/UX
### Color Scheme (TailwindCSS)

- **Primary**: Indigo (indigo-600, indigo-700)
- **Success**: Green (green-500, green-600)
- **Warning**: Orange (orange-500, orange-600)
- **Danger**: Red (red-500, red-600)
- **Neutral**: Gray (gray-50 to gray-900)
- **Background**: gray-50
- **Sidebar**: slate-900
- **Text**: gray-800, gray-600

### Icons (React Icons)

- FaUserGraduate - Học sinh
- FaUserTie - Tài xế
- FaBus - Xe buýt
- FaRoute - Tuyến đường
- FaMapPin - Điểm dừng
- FaCalendarAlt - Lịch trình
- FaMapMarkedAlt - Bản đồ
- FaBell - Thông báo
- FaSignOutAlt - Đăng xuất
- FaPlus, FaEdit, FaTrash - CRUD actions

## 🔧 Công nghệ sử dụng

### Core Technologies

- **React v18.3.1**: UI library
- **React Router DOM v7.9.2**: Routing
- **Vite v7.1.7**: Build tool & dev server
- **TailwindCSS v4.1.13**: Utility-first CSS framework

### UI Components & Icons

- **React Icons v5.5.0**: Icon library
- **@tailwindcss/vite v4.1.13**: Vite plugin for Tailwind

### Map Integration

- **@goongmaps/goong-map-react v1.1.2**: Goong Maps React wrapper
- **@mapbox/polyline v1.2.1**: Polyline decoder for directions

### HTTP Client

- **Axios v1.12.2**: Promise-based HTTP client

### Development Tools

- **ESLint v9.36.0**: Code linting
- **@vitejs/plugin-react v5.0.3**: Vite plugin for React
- **TypeScript types**: @types/react, @types/react-dom

## 📁 Cấu trúc thư mục

```
cnpm-frontend/
├── public/                    # Static assets
│   └── vite.svg              # Vite logo
│
├── src/                       # Source code
│   ├── assets/               # Images, fonts
│   │   └── react.svg
│   │
│   ├── components/           # Reusable components
│   │   ├── Layout.jsx                  # Main layout with sidebar
│   │   ├── MapComponent.jsx            # Goong Maps wrapper
│   │   ├── Card.jsx                    # Card component
│   │   ├── StudentModal.jsx            # Add/Edit student
│   │   ├── ParentModal.jsx             # Add/Edit parent
│   │   ├── DriverModal.jsx             # Add/Edit driver
│   │   ├── BusModal.jsx                # Add/Edit bus
│   │   ├── RouteModal.jsx              # Add/Edit route
│   │   ├── StopModal.jsx               # Add/Edit stop
│   │   ├── ScheduleModal.jsx           # Add/Edit schedule
│   │   ├── ScheduleDetailModal.jsx     # View schedule details
│   │   ├── AccountModal.jsx            # Add account
│   │   ├── EditAccountModal.jsx        # Edit account
│   │   └── ChangePasswordModal.jsx     # Change password
│   │
│   ├── pages/                # Page components
│   │   ├── Common/           # Shared pages
│   │   │   ├── DangNhap.jsx           # Login page
│   │   │   └── ThongBao.jsx           # Notifications
│   │   │
│   │   ├── Admin/            # Admin pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuanLyHocSinh.jsx
│   │   │   ├── QuanLyPhuHuynh.jsx
│   │   │   ├── QuanLyTaiXe.jsx
│   │   │   ├── QuanLyXeBus.jsx
│   │   │   ├── QuanLyTuyenDuong.jsx
│   │   │   ├── QuanLyTram.jsx
│   │   │   ├── QuanLyLichTrinh.jsx
│   │   │   ├── GuiThongBao.jsx
│   │   │   └── QuanLyTaiKhoan.jsx
│   │   │
│   │   ├── Driver/           # Driver pages
│   │   │   ├── DiemDanhHocSinh.jsx
│   │   │   └── XemLichTrinh.jsx
│   │   │
│   │   └── Parent/           # Parent pages
│   │       ├── TheoDoiXeBuyt.jsx
│   │       └── ThongTinPhuHuynh.jsx
│   │
│   ├── services/             # API services
│   │   ├── apiClient.jsx            # Axios instance
│   │   ├── authService.jsx          # Auth API calls
│   │   └── goongApi.jsx             # Map API calls
│   │
│   ├── App.jsx               # Root component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
│
├── index.html                # HTML template
├── package.json              # Dependencies
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
├── tailwind.config.js        # Tailwind configuration (if any)
└── README.md                 # Documentation
```

## 🚀 Cài đặt và chạy

### Prerequisites

- Node.js >= 18.x
- npm hoặc yarn
- Backend API đang chạy

### Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd cnpm-frontend

# Cài đặt dependencies
npm install
```

### Cấu hình

1. **API Base URL**: Cấu hình trong `src/services/apiClient.jsx`
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Backend URL
  timeout: 10000,
});
```

2. **Goong Maps API Key**: Cấu hình trong `src/services/goongApi.jsx`
```javascript
const GOONG_API_KEY = 'your_goong_api_key';
const GOONG_MAPTILES_KEY = 'your_maptiles_key';
```

### Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

Development server: `http://localhost:5173`
