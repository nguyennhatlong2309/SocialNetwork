using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;

namespace SocialNetwork.Infrastructure.Repositories;

public class PostRepository : Repository<Post>, IPostRepository
{
    public PostRepository(SocialNetworkDbContext context) : base(context) { }

    public async Task<IEnumerable<Post>> GetPostsWithDetailsAsync(int page, int pageSize)
    {
        return await _dbSet
            .Where(p => !p.IsDeleted)
            .Include(p => p.User)
            .Include(p => p.Media)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Post>> GetUserPostsAsync(long userId, int page, int pageSize)
    {
        return await _dbSet
            .Where(p => !p.IsDeleted && p.UserId == userId)
            .Include(p => p.User)
            .Include(p => p.Media)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Post?> GetPostWithDetailsAsync(long postId)
    {
        return await _dbSet
            .Include(p => p.User)
            .Include(p => p.Media)
            .Include(p => p.Comments.Where(c => !c.IsDeleted))
                .ThenInclude(c => c.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);
    }
}
