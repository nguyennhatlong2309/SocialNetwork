using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.API.Services;

/// <summary>
/// Lưu file vào wwwroot/uploads/ trên server local.
/// Đặt ở API layer vì cần IWebHostEnvironment (Web-specific dependency).
/// Để production, tạo CloudinaryFileStorageService ở Infrastructure layer.
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/webm", "video/ogg", "video/quicktime"
        };

    // Giới hạn kích thước: 50MB
    private const long MaxFileSizeBytes = 50L * 1024 * 1024;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder)
    {
        // Validate content type
        if (!AllowedTypes.Contains(contentType.ToLower()))
            throw new ArgumentException($"File type '{contentType}' is not allowed.");

        // Validate size (chỉ check được nếu stream support Length)
        if (fileStream.CanSeek && fileStream.Length > MaxFileSizeBytes)
            throw new ArgumentException($"File size exceeds limit of {MaxFileSizeBytes / 1024 / 1024}MB.");

        // Tạo unique filename
        var extension = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(extension))
            extension = contentType.StartsWith("video", StringComparison.OrdinalIgnoreCase) ? ".mp4" : ".jpg";

        var uniqueFileName = $"{Guid.NewGuid():N}{extension}";

        // Đảm bảo thư mục tồn tại
        var webRootPath = _env.WebRootPath
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadPath = Path.Combine(webRootPath, "uploads", folder);
        Directory.CreateDirectory(uploadPath);

        // Lưu file
        var filePath = Path.Combine(uploadPath, uniqueFileName);
        await using var output = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(output);

        // Trả về relative URL public
        return $"/uploads/{folder}/{uniqueFileName}";
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        if (string.IsNullOrEmpty(fileUrl)) return Task.CompletedTask;

        var webRootPath = _env.WebRootPath
            ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(webRootPath, relativePath));
        var allowedRoot = Path.GetFullPath(Path.Combine(webRootPath, "uploads"));

        // Anti-Path Traversal Check
        if (!fullPath.StartsWith(allowedRoot, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Cannot delete files outside of the uploads directory.");
        }

        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
