using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Interfaces;

public interface IPostRepository : IRepository<Post>
{
    Task<IEnumerable<Post>> GetPostsWithDetailsAsync(int page, int pageSize);
    Task<IEnumerable<Post>> GetUserPostsAsync(long userId, int page, int pageSize);
    Task<Post?> GetPostWithDetailsAsync(long postId);
}
