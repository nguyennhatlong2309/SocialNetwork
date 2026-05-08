using SocialNetwork.Application.DTOs.Post;

namespace SocialNetwork.Application.Interfaces;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetPostsAsync(int page, int pageSize);
    Task<PostDetailDto?> GetPostByIdAsync(long postId);
    Task<PostDto> CreatePostAsync(long userId, CreatePostDto dto);
}
