using AutoMapper;
using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IRealtimeNotificationService _realtimeService;
    private readonly IMapper _mapper;

    public NotificationService(
        INotificationRepository notificationRepository,
        IRealtimeNotificationService realtimeService,
        IMapper mapper)
    {
        _notificationRepository = notificationRepository;
        _realtimeService = realtimeService;
        _mapper = mapper;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tạo mới thông báo (KHÔNG gom nhóm) — giữ nguyên để không breaking change
    // ─────────────────────────────────────────────────────────────────────────
    public async Task CreateAndPushAsync(CreateNotificationDto dto)
    {
        // Không gửi thông báo cho chính mình
        if (dto.SenderId.HasValue && dto.SenderId.Value == dto.ReceiverId)
            return;

        var notification = new Notification
        {
            SenderId = dto.SenderId,
            ReceiverId = dto.ReceiverId,
            Type = dto.Type,
            ReferenceId = dto.ReferenceId,
            Content = dto.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);

        var created = await _notificationRepository.GetWithSenderAsync(notification.Id);
        await _realtimeService.PushAsync(dto.ReceiverId, MapToDto(created ?? notification));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Gom nhóm thông báo: Upsert theo (ReceiverId, Type, ReferenceId)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task CreateOrUpdateAndPushAsync(CreateNotificationDto dto, int actorCount = 1)
    {
        // Không gửi thông báo cho chính mình
        if (dto.SenderId.HasValue && dto.SenderId.Value == dto.ReceiverId)
            return;

        // ReferenceId bắt buộc phải có với logic gom nhóm
        if (!dto.ReferenceId.HasValue)
        {
            await CreateAndPushAsync(dto);
            return;
        }

        var existing = await _notificationRepository
            .FindGroupedAsync(dto.ReceiverId, dto.Type, dto.ReferenceId.Value);

        Notification notification;

        if (existing != null)
        {
            // ── Cập nhật thông báo đã có ──────────────────────────────────
            existing.SenderId = dto.SenderId;                   // Người tương tác mới nhất
            existing.Content = BuildGroupedContent(dto.Content, actorCount);
            existing.IsRead = false;                            // Đánh dấu chưa đọc lại
            existing.UpdatedAt = DateTime.UtcNow;

            await _notificationRepository.UpdateAsync(existing);

            // Reload để có navigation property Sender đầy đủ
            notification = await _notificationRepository.GetWithSenderAsync(existing.Id)
                           ?? existing;
        }
        else
        {
            // ── Tạo mới ──────────────────────────────────────────────────
            var newNotification = new Notification
            {
                SenderId = dto.SenderId,
                ReceiverId = dto.ReceiverId,
                Type = dto.Type,
                ReferenceId = dto.ReferenceId,
                Content = BuildGroupedContent(dto.Content, actorCount),
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(newNotification);
            notification = await _notificationRepository.GetWithSenderAsync(newNotification.Id)
                           ?? newNotification;
        }

        await _realtimeService.PushAsync(dto.ReceiverId, MapToDto(notification));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Xóa thông báo gom nhóm
    // ─────────────────────────────────────────────────────────────────────────
    public async Task DeleteNotificationAsync(long receiverId, NotificationType type, long referenceId)
    {
        await _notificationRepository.DeleteGroupedAsync(receiverId, type, referenceId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Các method cũ (không thay đổi)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<NotificationDto>> GetNotificationsAsync(long userId, int page, int pageSize)
    {
        var notifications = await _notificationRepository.GetByReceiverIdAsync(userId, page, pageSize);
        return notifications.Select(MapToDto);
    }

    public async Task MarkAsReadAsync(long notificationId, long userId)
    {
        var notification = await _notificationRepository.GetByIdAsync(notificationId)
            ?? throw new KeyNotFoundException($"Notification {notificationId} not found.");

        if (notification.ReceiverId != userId)
            throw new UnauthorizedAccessException("Cannot mark another user's notification as read.");

        notification.IsRead = true;
        await _notificationRepository.UpdateAsync(notification);
    }

    public async Task MarkAllAsReadAsync(long userId)
    {
        var unread = await _notificationRepository.FindAsync(
            n => n.ReceiverId == userId && !n.IsRead);

        foreach (var n in unread)
            n.IsRead = true;

        if (unread.Any())
            await _notificationRepository.SaveChangesAsync();
    }

    public async Task<int> GetUnreadCountAsync(long userId)
    {
        return await _notificationRepository.CountUnreadAsync(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// Sinh nội dung thông báo có gom nhóm.
    /// actorCount = 1  → "đã thích bài viết của bạn."  (baseContent gốc)
    /// actorCount = 2  → "và 1 người khác đã thích bài viết của bạn."
    /// actorCount >= 3 → "và X người khác đã thích bài viết của bạn."
    /// </summary>
    private static string BuildGroupedContent(string? baseContent, int actorCount)
    {
        if (actorCount <= 1 || string.IsNullOrWhiteSpace(baseContent))
            return baseContent ?? string.Empty;

        int others = actorCount - 1;
        return $"và {others} người khác {baseContent}";
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        SenderId = n.SenderId,
        SenderName = n.Sender?.FullName ?? n.Sender?.Username,
        SenderAvatar = n.Sender?.AvatarUrl,
        ReceiverId = n.ReceiverId,
        Type = n.Type.ToString().ToLower(),
        ReferenceId = n.ReferenceId,
        Content = n.Content,
        IsRead = n.IsRead,
        CreatedAt = n.UpdatedAt  // Hiển thị UpdatedAt cho client, vì đây là timestamp gom nhóm mới nhất
    };
}
