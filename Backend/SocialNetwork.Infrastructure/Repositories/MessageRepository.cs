using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;

namespace SocialNetwork.Infrastructure.Repositories;

public class MessageRepository : Repository<Message>, IMessageRepository
{
    public MessageRepository(SocialNetworkDbContext context) : base(context) { }

    public async Task<IEnumerable<Message>> GetConversationMessagesAsync(
        long conversationId, int page, int pageSize)
    {
        return await _dbSet
            .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
            .Include(m => m.Sender)
            .Include(m => m.Attachments)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(long userId)
    {
        return await _context.ConversationMembers
            .Where(cm => cm.UserId == userId && cm.LeftAt == null)
            .Include(cm => cm.Conversation)
                .ThenInclude(c => c.LastMessage!)
                    .ThenInclude(m => m.Sender)
            .Include(cm => cm.Conversation)
                .ThenInclude(c => c.Members)
                    .ThenInclude(m => m.User)
            .Select(cm => cm.Conversation)
            .OrderByDescending(c => c.UpdatedAt)
            .AsNoTracking()
            .ToListAsync();
    }
}
