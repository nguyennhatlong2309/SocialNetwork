using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SocialNetwork.API.Hubs;

/// <summary>
/// Hub xử lý kết nối real-time cho Chat (Tin nhắn).
/// Client join/leave group theo conversationId.
/// Event client nhận: "ReceiveMessage" với payload MessageDto.
/// </summary>
[Authorize]
public class ChatHub : Hub
{
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(ILogger<ChatHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        _logger.LogInformation(
            "User {UserId} connected to ChatHub. ConnectionId: {ConnectionId}",
            userId, Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        _logger.LogInformation(
            "User {UserId} disconnected from ChatHub. ConnectionId: {ConnectionId}",
            userId, Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Client gọi để join vào group của một conversation.
    /// Sau đó sẽ nhận được tất cả tin nhắn trong conversation này.
    /// </summary>
    public async Task JoinConversation(long conversationId)
    {
        var groupName = GetGroupName(conversationId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        _logger.LogDebug("ConnectionId {Id} joined conversation group {Group}",
            Context.ConnectionId, groupName);
    }

    /// <summary>
    /// Client gọi để rời khỏi group của một conversation.
    /// </summary>
    public async Task LeaveConversation(long conversationId)
    {
        var groupName = GetGroupName(conversationId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }

    private long? GetUserId()
    {
        var claim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return long.TryParse(claim, out var id) ? id : null;
    }

    public static string GetGroupName(long conversationId) => $"conversation_{conversationId}";
}
