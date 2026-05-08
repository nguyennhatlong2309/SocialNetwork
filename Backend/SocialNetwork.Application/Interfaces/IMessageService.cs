using SocialNetwork.Application.DTOs.Message;

namespace SocialNetwork.Application.Interfaces;

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(long senderId, SendMessageDto dto);
    Task<IEnumerable<MessageDto>> GetConversationMessagesAsync(long userId, long conversationId, int page, int pageSize);
    Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(long userId);
}
