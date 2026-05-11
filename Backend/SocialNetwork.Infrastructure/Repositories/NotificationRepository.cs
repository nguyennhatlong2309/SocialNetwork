using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;

namespace SocialNetwork.Infrastructure.Repositories;

public class NotificationRepository : Repository<Notification>, INotificationRepository
{
    public NotificationRepository(SocialNetworkDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Notification>> GetByReceiverIdAsync(long receiverId, int page, int pageSize)
    {
        return await _context.Notifications
            .Where(n => n.ReceiverId == receiverId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(n => n.Sender)
            .ToListAsync();
    }

    public async Task<int> CountUnreadAsync(long receiverId)
    {
        return await _context.Notifications
            .CountAsync(n => n.ReceiverId == receiverId && !n.IsRead);
    }

    public async Task<Notification?> GetWithSenderAsync(long notificationId)
    {
        return await _context.Notifications
            .Include(n => n.Sender)
            .FirstOrDefaultAsync(n => n.Id == notificationId);
    }
}
