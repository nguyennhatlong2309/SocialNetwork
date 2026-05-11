using Microsoft.AspNetCore.SignalR;
using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.API.Hubs;
using SocialNetwork.API.Services;

namespace SocialNetwork.API.Services;

/// <summary>
/// Triển khai IRealtimeNotificationService bằng SignalR IHubContext.
/// Đặt ở API layer để Application layer không phụ thuộc SignalR.
/// </summary>
public class HubNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<HubNotificationService> _logger;

    public HubNotificationService(
        IHubContext<NotificationHub> hubContext,
        IConnectionManager connectionManager,
        ILogger<HubNotificationService> logger)
    {
        _hubContext = hubContext;
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public async Task PushAsync(long userId, NotificationDto notification)
    {
        var connectionIds = _connectionManager.GetConnections(userId);

        if (!connectionIds.Any())
        {
            _logger.LogDebug(
                "User {UserId} has no active SignalR connections — notification stored in DB only.",
                userId);
            return;
        }

        // Push tới tất cả tab/thiết bị đang mở của user
        await _hubContext.Clients
            .Clients(connectionIds)
            .SendAsync("ReceiveNotification", notification);

        _logger.LogDebug(
            "Pushed notification type={Type} to User {UserId} ({Count} connections)",
            notification.Type, userId, connectionIds.Count);
    }
}
