using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Interfaces;

public interface IMessageRepository : IRepository<Message>
{
    Task<IEnumerable<Message>> GetConversationMessagesAsync(long conversationId, int page, int pageSize);
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(long userId);
}
