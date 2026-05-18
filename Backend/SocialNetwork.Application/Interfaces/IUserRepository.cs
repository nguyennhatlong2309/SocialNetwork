using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> ExistsByUsernameAsync(string username);
    Task<bool> ExistsByEmailAsync(string email);
    Task<IEnumerable<User>> SearchUsersAsync(string query, int count = 10);
}
