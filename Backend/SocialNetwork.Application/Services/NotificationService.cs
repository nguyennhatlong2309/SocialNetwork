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

    public async Task CreateAndPushAsync(CreateNotificationDto dto)
    {
        // Không gửi thông báo cho chính mình
        if (dto.SenderId.HasValue && dto.SenderId.Value == dto.ReceiverId)
            return;

        // Lưu vào DB
        var notification = new Notification
        {
            SenderId = dto.SenderId,
            ReceiverId = dto.ReceiverId,
            Type = dto.Type,
            ReferenceId = dto.ReferenceId,
            Content = dto.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);

        // Reload với thông tin sender để push
        var created = await _notificationRepository.GetWithSenderAsync(notification.Id);
        var notifDto = MapToDto(created ?? notification);

        // Push real-time xuống client (fire-and-forget, không block)
        await _realtimeService.PushAsync(dto.ReceiverId, notifDto);
    }

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
        CreatedAt = n.CreatedAt
    };
}
