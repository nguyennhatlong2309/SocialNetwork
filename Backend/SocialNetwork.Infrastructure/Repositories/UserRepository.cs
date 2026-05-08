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
}
