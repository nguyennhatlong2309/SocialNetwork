# 🌐 Social Network Platform

> Nền tảng mạng xã hội full-stack với tính năng realtime messaging, thông báo, quản lý bài viết, và hệ thống phân quyền người dùng.

---

## 👤 Thông Tin Người Thực Hiện

| Thông tin             | Chi tiết                        |
| ---------------------- | -------------------------------- |
| **Họ và tên** | Nguyễn Nhật Long (Anh Long)    |
| **Dự án**      | Social Network Platform          |
| **Học kỳ**     | HK2 – 2025/2026                 |
| **GitHub**       | nguyennhatlong2309/SocialNetwork |

---

## 📋 Mô Tả Dự Án

**Social Network Platform** là một ứng dụng mạng xã hội full-stack được xây dựng theo kiến trúc phân lớp (Layered Architecture). Dự án bao gồm:

- **Backend**: RESTful API với .NET 10, xác thực JWT, realtime qua SignalR
- **Frontend**: SPA với React 19 + Vite, giao diện người dùng và bảng điều khiển quản trị

**Tính năng nổi bật:**

- Đăng ký/đăng nhập với JWT & Refresh Token
- Đăng bài, like, comment, share, lưu bài viết
- Nhắn tin realtime (1-1 và nhóm) qua SignalR
- Thông báo realtime (follow, like, comment, v.v.)
- Theo dõi / chặn người dùng
- Story (ảnh/video 24h)
- Hệ thống phân quyền: Member / Moderator / Admin
- Trang Admin: quản lý người dùng, kiểm duyệt nội dung, cài đặt hệ thống
- Upload ảnh/video cho bài viết và avatar

---

## 🛠️ Công Nghệ Sử Dụng

### Backend

| Thành phần             | Công nghệ                              |
| ------------------------ | ---------------------------------------- |
| **Framework**      | ASP.NET Core 10 (Web API)                |
| **ORM**            | Entity Framework Core 9 + Pomelo (MySQL) |
| **Database**       | MySQL 8.0                                |
| **Xác thực**     | JWT Bearer + Refresh Token               |
| **Realtime**       | ASP.NET Core SignalR (WebSocket)         |
| **Object Mapping** | AutoMapper                               |
| **API Docs**       | Swagger / OpenAPI (Swashbuckle)          |
| **Logging**        | Microsoft.Extensions.Logging             |

### Frontend

| Thành phần              | Công nghệ                               |
| ------------------------- | ----------------------------------------- |
| **Framework**       | React 19 + Vite 8                         |
| **Routing**         | React Router DOM v7                       |
| **HTTP Client**     | Axios                                     |
| **Realtime Client** | @microsoft/signalr v10                    |
| **Server State**    | TanStack React Query v5                   |
| **Animation**       | Framer Motion                             |
| **Icons**           | Lucide React                              |
| **Styling**         | Vanilla CSS (biến CSS, dark/light theme) |

---

## 🗄️ Bảng Cơ Sở Dữ Liệu (Database Schema)

| Bảng                   | Mô tả                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `Users`               | Tài khoản người dùng (thông tin, role, trạng thái)     |
| `UserSettings`        | Cài đặt cá nhân (theme, ngôn ngữ, quyền riêng tư...) |
| `UserSessions`        | Phiên đăng nhập của người dùng                         |
| `RefreshTokens`       | Refresh token cho xác thực lâu dài                         |
| `Posts`               | Bài đăng (nội dung, quyền riêng tư, hashtag)            |
| `PostMedia`           | File đính kèm của bài đăng (ảnh/video)                 |
| `PostHashtags`        | Liên kết bài đăng – hashtag (nhiều-nhiều)              |
| `Hashtags`            | Danh sách hashtag                                             |
| `Comments`            | Bình luận bài đăng (hỗ trợ reply)                       |
| `Likes`               | Lượt thích bài đăng                                      |
| `Shares`              | Lượt chia sẻ bài đăng                                    |
| `SavedPosts`          | Bài đăng đã lưu                                          |
| `Follows`             | Quan hệ theo dõi giữa người dùng                         |
| `FollowRequests`      | Yêu cầu theo dõi (tài khoản riêng tư)                   |
| `Blocks`              | Danh sách chặn người dùng                                 |
| `Stories`             | Story 24h (ảnh/video)                                         |
| `StoryViews`          | Lượt xem story                                               |
| `Conversations`       | Phòng chat (1-1 hoặc nhóm)                                  |
| `ConversationMembers` | Thành viên trong cuộc trò chuyện                          |
| `Messages`            | Tin nhắn trong cuộc hội thoại                              |
| `MessageAttachments`  | File đính kèm trong tin nhắn                               |
| `MessageReads`        | Trạng thái đã đọc tin nhắn                              |
| `Notifications`       | Thông báo hệ thống                                         |
| `Reports`             | Báo cáo vi phạm nội dung                                   |

---

## 📁 Cấu Trúc Thư Mục

```
SocialNetworkP/
├── Backend/                            # .NET Solution
│   ├── SocialNetwork.slnx              # Solution file
│   ├── SocialNetwork.API/              # Tầng trình bày (Presentation Layer)
│   │   ├── Controllers/                # API Controllers
│   │   │   ├── AuthController.cs       # Đăng ký, đăng nhập, refresh token
│   │   │   ├── PostsController.cs      # CRUD bài đăng, like, comment, share
│   │   │   ├── UsersController.cs      # Hồ sơ, follow, block, tìm kiếm
│   │   │   ├── MessagesController.cs   # Chat, cuộc hội thoại
│   │   │   ├── NotificationsController.cs # Thông báo
│   │   │   └── AdminController.cs      # Quản trị hệ thống
│   │   ├── Hubs/                       # SignalR Hubs
│   │   │   ├── ChatHub.cs              # Realtime chat
│   │   │   └── NotificationHub.cs      # Realtime notifications
│   │   ├── Extensions/                 # Middleware & Extensions
│   │   │   └── DatabaseSeeder.cs       # Seed dữ liệu mẫu khi dev
│   │   ├── Services/                   # API-layer services
│   │   ├── Properties/
│   │   ├── wwwroot/                    # Static files (uploads/)
│   │   ├── appsettings.json            # Cấu hình production
│   │   ├── appsettings.Development.json # Cấu hình development (⚠️ chỉnh theo máy)
│   │   └── Program.cs                  # Entry point, DI container
│   │
│   ├── SocialNetwork.Application/      # Tầng ứng dụng (Application Layer)
│   │   ├── DTOs/                       # Data Transfer Objects
│   │   ├── Interfaces/                 # Định nghĩa interface service & repo
│   │   ├── Mappings/                   # AutoMapper profiles
│   │   └── Services/                   # Triển khai business logic
│   │
│   ├── SocialNetwork.Domain/           # Tầng miền (Domain Layer)
│   │   ├── Entities/                   # Entity classes (24 bảng)
│   │   └── Enums/                      # Enum types (11 loại)
│   │
│   └── SocialNetwork.Infrastructure/   # Tầng hạ tầng (Infrastructure Layer)
│       ├── Data/                       # DbContext (EF Core)
│       ├── Migrations/                 # EF Core Migrations
│       ├── Repositories/               # Triển khai Repository Pattern
│       └── Services/                   # Infrastructure services (file storage...)
│
├── Frontend/                           # React SPA
│   ├── src/
│   │   ├── api/                        # Axios instances & interceptors
│   │   ├── assets/                     # Ảnh, icon tĩnh
│   │   ├── components/                 # UI components dùng chung
│   │   ├── contexts/                   # React Context (Auth, Theme...)
│   │   ├── hooks/                      # Custom React hooks
│   │   ├── pages/
│   │   │   ├── user/                   # Trang người dùng
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── NewsFeedPage.jsx
│   │   │   │   ├── UserProfilePage.jsx
│   │   │   │   ├── PostDetailPage.jsx
│   │   │   │   ├── CreatePostPage.jsx
│   │   │   │   ├── InboxPage.jsx
│   │   │   │   ├── ChatViewPage.jsx
│   │   │   │   ├── NotificationsPage.jsx
│   │   │   │   ├── SettingsPage.jsx
│   │   │   │   └── OnboardingPage.jsx
│   │   │   └── admin/                  # Trang quản trị
│   │   │       ├── AdminDashboardPage.jsx
│   │   │       ├── AdminUserManagementPage.jsx
│   │   │       ├── AdminModerationPage.jsx
│   │   │       └── AdminSettingsPage.jsx
│   │   ├── services/                   # Business logic phía client
│   │   ├── App.jsx                     # Router chính
│   │   ├── main.jsx                    # Entry point
│   │   └── index.css                   # Global CSS & theme variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## ✨ Chức Năng

### 🙍 Người Dùng (User)

| Nhóm chức năng        | Chi tiết                                                                 |
| ------------------------ | ------------------------------------------------------------------------- |
| **Xác thực**     | Đăng ký, đăng nhập, đăng xuất, làm mới token tự động        |
| **Bài đăng**    | Tạo, xem, xoá bài; like, comment, share, lưu bài; hashtag            |
| **Hồ sơ**        | Xem/chỉnh sửa profile, avatar, cover, bio, thông tin cá nhân         |
| **Mạng xã hội** | Follow/Unfollow, gửi yêu cầu theo dõi (tài khoản riêng tư), chặn |
| **Nhắn tin**      | Chat 1-1 và nhóm, gửi file đính kèm, xem trạng thái đã đọc // |
| **Thông báo**    | Nhận thông báo realtime khi có like, comment, follow, mention         |
| **Story**          | Đăng story 24h, xem story của người theo dõi //                     |
| **Cài đặt**     | Đổi email, đổi mật khẩu, cài đặt hiển thị (theme, font...)     |

### 🛡️ Quản Trị (Admin)

| Nhóm chức năng               | Chi tiết                                                           |
| ------------------------------- | ------------------------------------------------------------------- |
| **Dashboard**             | Thống kê tổng quan: users, posts, reports, hoạt động          |
| **Quản lý User**        | Xem danh sách, ban/unban tài khoản, phân quyền Moderator/Admin |
| **Kiểm duyệt**          | Xem & xử lý báo cáo vi phạm nội dung                          |
| **Cài đặt hệ thống** | Cài đặt hiển thị, theme, ngôn ngữ cho toàn bộ hệ thống   |

---

## 🚀 Cách Khởi Chạy

### Yêu Cầu Cần Có

- [.NET SDK 10](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js ≥ 20](https://nodejs.org/)
- [MySQL 8.0](https://dev.mysql.com/downloads/mysql/) (chạy trên cổng **3307** theo cấu hình mặc định)

---

### ⚙️ Bước 1: Cấu Hình Database

Mở file **`Backend/SocialNetwork.API/appsettings.Development.json`** và chỉnh sửa Connection String cho phù hợp với máy của bạn:

```json
{
  "ConnectionStrings": {
    // ⚠️ Chỉnh sửa các thông số sau cho phù hợp với MySQL của bạn:
    //   Server   = hostname (localhost hoặc IP máy chủ MySQL)
    //   Port     = cổng MySQL (mặc định 3306, dự án đang dùng 3307)
    //   Database = tên database (sẽ tự tạo khi migrate)
    //   User     = username MySQL của bạn
    //   Password = mật khẩu MySQL của bạn
    "DefaultConnection": "Server=localhost;Port=3307;Database=social_network_db;User=root;Password=123456;"
  },
  "JwtSettings": {
    // ⚠️ Nên đổi Secret Key này thành một chuỗi ngẫu nhiên khác (ít nhất 64 ký tự)
    //   để đảm bảo bảo mật. Thay đổi Secret sẽ làm vô hiệu toàn bộ token hiện tại.
    "Secret": "ThanhTinChiLaMotSuThoaHiepKhiKhongTheLamGi44MotSuNguyTrangSinhDepMotCaiRatThat",
    "Issuer": "SocialNetworkAPI",
    "Audience": "SocialNetworkClient",
    "AccessTokenExpirationMinutes": "120",
    "RefreshTokenExpirationDays": "30"
  }
}
```

> **Lưu ý:** Nếu MySQL của bạn chạy trên cổng **3306** (mặc định), đổi `Port=3307` thành `Port=3306`.

---

### ⚙️ Bước 2: Chạy Backend (.NET API)

```powershell
# Di chuyển vào thư mục Backend
cd Backend/SocialNetwork.API

# Khôi phục packages
dotnet restore

# Áp dụng Migration để tạo database
dotnet ef database update --project ../SocialNetwork.Infrastructure --startup-project .

# Chạy API (chế độ Development sẽ tự seed dữ liệu mẫu và mở Swagger)
dotnet run --environment Development
```

> API sẽ chạy tại: **`http://localhost:5000`** (hoặc port được chỉ định trong `Properties/launchSettings.json`)
>
> Swagger UI: **`http://localhost:5000`** (root path)
>
> SignalR Chat Hub: **`ws://localhost:5000/hubs/chat`**
>
> SignalR Notification Hub: **`ws://localhost:5000/hubs/notifications`**

---

### ⚙️ Bước 3: Chạy Frontend (React + Vite)

```powershell
# Di chuyển vào thư mục Frontend
cd Frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

> Frontend sẽ chạy tại: **`http://localhost:5173`**

---

### ⚙️ Bước 4: Kiểm Tra Kết Nối

Đảm bảo URL API trong frontend trỏ đúng vào backend. Kiểm tra file cấu hình API (thường là `Frontend/src/api/`):

```js
// Frontend/src/api/axiosInstance.js (hoặc tương đương)
// ⚠️ Đổi baseURL nếu backend chạy ở port khác
const API_BASE_URL = "http://localhost:5000/api";
```

---

### 👤 Tài Khoản Mẫu (Seed Data)

Khi chạy ở môi trường **Development**, hệ thống sẽ tự động tạo dữ liệu mẫu:

| Username      | Password      | Role      |
| ------------- | ------------- | --------- |
| `admin`     | `Admin@123` | Admin     |
| `moderator` | `Mod@123`   | Moderator |
| `user1`     | `User@123`  | Member    |

> *(Kiểm tra file `Backend/SocialNetwork.API/Extensions/DatabaseSeeder.cs` để biết chính xác dữ liệu seed)*

---

## 🏗️ Kiến Trúc Phân Lớp

Dự án backend tuân theo **Clean Architecture** kết hợp **Layered Architecture**, chia thành 4 tầng độc lập:

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer (API)               │
│  Controllers · SignalR Hubs · Middleware        │
│  → Nhận request, trả response, xác thực JWT    │
├─────────────────────────────────────────────────┤
│          Application Layer                      │
│  Services · DTOs · Interfaces · AutoMapper      │
│  → Điều phối logic nghiệp vụ, mapping dữ liệu  │
├─────────────────────────────────────────────────┤
│            Domain Layer                         │
│  Entities · Enums                               │
│  → Định nghĩa model nghiệp vụ, không phụ thuộc │
├─────────────────────────────────────────────────┤
│         Infrastructure Layer                    │
│  EF Core DbContext · Repositories · Migrations  │
│  File Storage · MySQL                           │
│  → Truy cập dữ liệu và dịch vụ bên ngoài       │
└─────────────────────────────────────────────────┘
```

### Nguyên tắc phụ thuộc (Dependency Rule)

```
API → Application → Domain
Infrastructure → Domain
Infrastructure → Application (implements interfaces)
```

- **Domain** không phụ thuộc vào bất kỳ layer nào
- **Application** chỉ phụ thuộc vào Domain, định nghĩa interface (không triển khai)
- **Infrastructure** triển khai interface của Application (Repository, File Storage...)
- **API** là điểm vào, biết tất cả các layer và wires chúng lại qua DI

### Design Patterns Sử Dụng

| Pattern                        | Nơi áp dụng                                               |
| ------------------------------ | ------------------------------------------------------------ |
| **Repository Pattern**   | `IRepository<T>`, `IUserRepository`, `IPostRepository` |
| **Service Layer**        | `IAuthService`, `IPostService`, `IUserService`...      |
| **DTO Pattern**          | Tách biệt Entity và dữ liệu trả về API                |
| **Dependency Injection** | Toàn bộ services, repositories đăng ký qua DI           |
| **Observer (SignalR)**   | Thông báo realtime qua Hub push đến client               |

---

## 📡 API Endpoints Chính

| Method | Endpoint                        | Mô tả                              | Auth |
| ------ | ------------------------------- | ------------------------------------ | ---- |
| POST   | `/api/auth/register`          | Đăng ký tài khoản               | ❌   |
| POST   | `/api/auth/login`             | Đăng nhập                         | ❌   |
| POST   | `/api/auth/refresh`           | Làm mới Access Token               | ❌   |
| GET    | `/api/posts`                  | Lấy danh sách bài viết (feed)    | ✅   |
| POST   | `/api/posts`                  | Tạo bài viết mới                 | ✅   |
| POST   | `/api/posts/{id}/like`        | Like/Unlike bài viết               | ✅   |
| GET    | `/api/users/{username}`       | Xem hồ sơ người dùng            | ✅   |
| POST   | `/api/users/{id}/follow`      | Follow/Unfollow                      | ✅   |
| GET    | `/api/messages/conversations` | Danh sách cuộc hội thoại         | ✅   |
| GET    | `/api/notifications`          | Danh sách thông báo               | ✅   |
| GET    | `/api/admin/users`            | Quản lý người dùng (Admin only) | 🔐   |

> Xem đầy đủ tại Swagger UI: `http://localhost:5000`
