using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    /// <summary>
    /// Lấy danh sách thông báo của user, sắp xếp theo thời gian mới nhất.
    /// </summary>
    Task<IEnumerable<Notification>> GetByReceiverIdAsync(long receiverId, int page, int pageSize);

    /// <summary>
    /// Đếm số thông báo chưa đọc của user.
    /// </summary>
    Task<int> CountUnreadAsync(long receiverId);

    /// <summary>
    /// Lấy notification kèm thông tin Sender (để push real-time với avatar, tên).
    /// </summary>
    Task<Notification?> GetWithSenderAsync(long notificationId);

    /// <summary>
    /// Tìm thông báo đã được gom nhóm theo (ReceiverId, Type, ReferenceId).
    /// Trả về null nếu chưa tồn tại.
    /// </summary>
    Task<Notification?> FindGroupedAsync(long receiverId, NotificationType type, long referenceId);

    /// <summary>
    /// Xóa thông báo đã gom nhóm theo (ReceiverId, Type, ReferenceId).
    /// Không throw nếu không tìm thấy.
    /// </summary>
    Task DeleteGroupedAsync(long receiverId, NotificationType type, long referenceId);
}
