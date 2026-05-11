using Microsoft.AspNetCore.SignalR;
using SocialNetwork.Application.DTOs.Message;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.API.Hubs;

namespace SocialNetwork.API.Services;

/// <summary>
/// Triển khai IRealtimeChatService bằng SignalR IHubContext&lt;ChatHub&gt;.
/// Push tin nhắn tới tất cả client trong group của conversation.
/// </summary>
public class HubChatService : IRealtimeChatService
{
    private readonly IHubContext<ChatHub> _hubContext;
    private readonly ILogger<HubChatService> _logger;

    public HubChatService(IHubContext<ChatHub> hubContext, ILogger<HubChatService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task PushNewMessageAsync(long conversationId, MessageDto message)
    {
        var groupName = ChatHub.GetGroupName(conversationId);

        await _hubContext.Clients
            .Group(groupName)
            .SendAsync("ReceiveMessage", message);

        _logger.LogDebug(
            "Pushed new message to conversation group {Group}", groupName);
    }
}
