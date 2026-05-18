using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.DTOs.Common;
using SocialNetwork.Application.DTOs.Message;
using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    private long GetCurrentUserId()
        => long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Get all conversations for the current user
    /// </summary>
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetCurrentUserId();
        var conversations = await _messageService.GetUserConversationsAsync(userId);
        return Ok(ApiResponse<IEnumerable<ConversationDto>>.SuccessResponse(conversations));
    }

    /// <summary>
    /// Get or create direct conversation with another user
    /// </summary>
    [HttpPost("conversation/with/{otherUserId}")]
    public async Task<IActionResult> GetOrCreateDirectConversation(long otherUserId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var conversation = await _messageService.GetOrCreateDirectConversationAsync(userId, otherUserId);
            return Ok(ApiResponse<ConversationDto>.SuccessResponse(conversation));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    /// <summary>
    /// Get messages in a conversation (paginated)
    /// </summary>
    [HttpGet("conversation/{conversationId}")]
    public async Task<IActionResult> GetMessages(
        long conversationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var userId = GetCurrentUserId();
            var messages = await _messageService
                .GetConversationMessagesAsync(userId, conversationId, page, pageSize);
            return Ok(ApiResponse<IEnumerable<MessageDto>>.SuccessResponse(messages));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    /// <summary>
    /// Send a message in a conversation
    /// </summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var message = await _messageService.SendMessageAsync(userId, dto);
            return Ok(ApiResponse<MessageDto>.SuccessResponse(message, "Message sent."));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }
}
