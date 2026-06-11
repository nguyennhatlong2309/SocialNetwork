# Exchange - Lịch sử thay đổi hiện tại

## Các thay đổi đã thực hiện

### 1. Phân quyền Admin & Sửa đổi JWT Token
*   **File sửa đổi:** [TokenService.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.Application/Services/TokenService.cs)
    - Thêm claim `ClaimTypes.Role` chứa vai trò của user (`user.Role.ToString()`) vào access token.
*   **File sửa đổi:** [AdminController.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Controllers/AdminController.cs)
    - Cấu hình lại bộ lọc từ `[Authorize]` thành `[Authorize(Roles = "Admin")]`. Các endpoint của Admin API hiện tại đã được bảo mật tuyệt đối ở tầng Backend, loại bỏ hoàn toàn khả năng người dùng thường cấm/promoted người dùng khác bằng cách gọi cURL/Postman.

### 2. Ngăn ngừa lỗ hổng Path Traversal
*   **File sửa đổi:** [LocalFileStorageService.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Services/LocalFileStorageService.cs)
    - Tích hợp kiểm tra bảo mật bằng cách phân giải đường dẫn thực tế (`Path.GetFullPath`) và chỉ cho phép thao tác xóa file nếu đường dẫn nằm trong phân vùng `wwwroot/uploads`.

### 3. Chuẩn hóa thu thập User ID từ JWT
*   **File tạo mới:** [ClaimsPrincipalExtensions.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Extensions/ClaimsPrincipalExtensions.cs)
    - Thêm phương thức mở rộng `User.GetUserId()` tiện ích giúp parse `ClaimTypes.NameIdentifier` một cách an toàn.
*   **File sửa đổi:** [PostsController.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Controllers/PostsController.cs) và [UsersController.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Controllers/UsersController.cs)
    - Refactor lại thuộc tính `CurrentUserId` / phương thức `GetCurrentUserId()` bằng cách sử dụng extension method mới để đảm bảo tính đồng bộ, sạch sẽ.

### 4. Bổ sung Global Exception Handling Middleware
*   **File tạo mới:** [ExceptionHandlingMiddleware.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Extensions/ExceptionHandlingMiddleware.cs)
    - Xây dựng middleware xử lý tất cả lỗi chưa được bắt, tự động log chi tiết và chuyển đổi lỗi thành phản hồi JSON chuẩn có cấu trúc: `ApiResponse<object>.ErrorResponse(...)`.
*   **File sửa đổi:** [Program.cs](file:///c:/Long/hk2_2025-2026/PersonalProject/SocialNetworkP/Backend/SocialNetwork.API/Program.cs)
    - Đăng ký middleware xử lý ngoại lệ ở vị trí đầu tiên của pipeline.

---

## Kết quả kiểm tra & xác minh

1. **Biên dịch dự án:**
   - Đã chạy lệnh `dotnet build` và dự án được build thành công:
     ```text
     Build succeeded.
         0 Warning(s)
         0 Error(s)
     ```
2. **Khởi chạy máy chủ API:**
   - Ứng dụng đã được khởi động lại thành công trong chế độ Development ở cổng mặc định:
     `Now listening on: http://localhost:5231`
     `Application started. Press Ctrl+C to shut down.`
