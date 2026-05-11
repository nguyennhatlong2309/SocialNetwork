using SocialNetwork.Application.DTOs.Notification;

namespace SocialNetwork.Application.Interfaces;

/// <summary>
/// Interface thuần túy để push thông báo real-time xuống client.
/// Application layer không biết đây là SignalR hay công nghệ gì khác.
/// </summary>
public interface IRealtimeNotificationService
{
    /// <summary>
    /// Đẩy thông báo tới một user cụ thể theo UserId.
    /// </summary>
    Task PushAsync(long userId, NotificationDto notification);
}
