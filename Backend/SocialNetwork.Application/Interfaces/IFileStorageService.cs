namespace SocialNetwork.Application.Interfaces;

/// <summary>
/// Abstraction cho việc lưu trữ file media.
/// Dùng Stream thay vì IFormFile để giữ Application layer framework-agnostic.
/// Hiện tại implement Local Storage, có thể swap sang Cloudinary/S3 sau.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Lưu một file vào storage và trả về URL public để truy cập.
    /// </summary>
    /// <param name="fileStream">Nội dung file dưới dạng Stream</param>
    /// <param name="fileName">Tên file gốc (để lấy extension)</param>
    /// <param name="contentType">MIME type (ví dụ: "image/jpeg", "video/mp4")</param>
    /// <param name="folder">Sub-folder (ví dụ: "posts", "avatars")</param>
    /// <returns>URL public của file (ví dụ: /uploads/posts/abc123.jpg)</returns>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, string folder);

    /// <summary>
    /// Xóa file khỏi storage theo URL của nó.
    /// </summary>
    Task DeleteFileAsync(string fileUrl);
}
