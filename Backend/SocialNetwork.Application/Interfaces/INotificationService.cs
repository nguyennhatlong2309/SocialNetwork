using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Tạo thông báo mới, lưu DB, và push real-time.
    /// </summary>
    Task CreateAndPushAsync(CreateNotificationDto dto);

    /// <summary>
    /// Gom nhóm thông báo: Nếu đã tồn tại thông báo cùng (ReceiverId, Type, ReferenceId)
    /// thì cập nhật lại (SenderId, Content, UpdatedAt, IsRead=false) rồi push.
    /// Nếu chưa tồn tại thì tạo mới như <see cref="CreateAndPushAsync"/>.
    /// </summary>
    /// <param name="dto">Thông tin thông báo.</param>
    /// <param name="actorCount">
    ///   Tổng số người đã tương tác (VD: tổng LikeCount). Khi > 1, Content sẽ được
    ///   reformat thành "A và X người khác đã thích bài viết của bạn."
    /// </param>
    Task CreateOrUpdateAndPushAsync(CreateNotificationDto dto, int actorCount = 1);

    /// <summary>
    /// Xóa thông báo gom nhóm theo (ReceiverId, Type, ReferenceId).
    /// Dùng khi hành động bị thu hồi hoàn toàn (VD: LikeCount = 0 sau khi unlike).
    /// </summary>
    Task DeleteNotificationAsync(long receiverId, NotificationType type, long referenceId);

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
