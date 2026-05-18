using Microsoft.EntityFrameworkCore;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;

namespace SocialNetwork.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(SocialNetworkDbContext context) : base(context) { }

    public async Task<User?> GetByUsernameAsync(string username)
        => await _dbSet.FirstOrDefaultAsync(u => u.Username == username);

    public async Task<User?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<bool> ExistsByUsernameAsync(string username)
        => await _dbSet.AnyAsync(u => u.Username == username);

    public async Task<bool> ExistsByEmailAsync(string email)
        => await _dbSet.AnyAsync(u => u.Email == email);

    public async Task<IEnumerable<User>> SearchUsersAsync(string query, int count = 10)
    {
        if (string.IsNullOrWhiteSpace(query))
            return Enumerable.Empty<User>();

        query = query.Trim().ToLower();
        return await _dbSet
            .Where(u => u.Username.ToLower().Contains(query) || (u.FullName != null && u.FullName.ToLower().Contains(query)))
            .Take(count)
            .ToListAsync();
    }
}
