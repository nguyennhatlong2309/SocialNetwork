using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SocialNetwork.API.Services;

namespace SocialNetwork.API.Hubs;

/// <summary>
/// Hub xử lý kết nối real-time cho thông báo (Notifications).
/// Client kết nối với JWT token, server tự động map UserId → ConnectionId.
/// </summary>
[Authorize]
public class NotificationHub : Hub
{
    private readonly IConnectionManager _connectionManager;
    private readonly ILogger<NotificationHub> _logger;

    public NotificationHub(IConnectionManager connectionManager, ILogger<NotificationHub> logger)
    {
        _connectionManager = connectionManager;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            _connectionManager.Add(userId.Value, Context.ConnectionId);
            _logger.LogInformation(
                "User {UserId} connected to NotificationHub. ConnectionId: {ConnectionId}",
                userId.Value, Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        if (userId.HasValue)
        {
            _connectionManager.Remove(userId.Value, Context.ConnectionId);
            _logger.LogInformation(
                "User {UserId} disconnected from NotificationHub. ConnectionId: {ConnectionId}",
                userId.Value, Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private long? GetUserId()
    {
        var claim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return long.TryParse(claim, out var id) ? id : null;
    }
}
