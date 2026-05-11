using SocialNetwork.Application.DTOs.Notification;

namespace SocialNetwork.Application.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Tạo thông báo mới, lưu DB, và push real-time.
    /// </summary>
    Task CreateAndPushAsync(CreateNotificationDto dto);

    /// <summary>
    /// Lấy danh sách thông báo của user (có phân trang).
    /// </summary>
    Task<IEnumerable<NotificationDto>> GetNotificationsAsync(long userId, int page, int pageSize);

    /// <summary>
    /// Đánh dấu thông báo đã đọc.
    /// </summary>
    Task MarkAsReadAsync(long notificationId, long userId);

    /// <summary>
    /// Đánh dấu tất cả thông báo của user là đã đọc.
    /// </summary>
    Task MarkAllAsReadAsync(long userId);

    /// <summary>
    /// Đếm số thông báo chưa đọc.
    /// </summary>
    Task<int> GetUnreadCountAsync(long userId);
}
