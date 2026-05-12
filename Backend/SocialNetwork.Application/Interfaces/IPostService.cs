using SocialNetwork.Application.DTOs.Post;

namespace SocialNetwork.Application.Interfaces;

public interface IPostService
{
    Task<IEnumerable<PostDto>> GetPostsAsync(long userId, int page, int pageSize);
    Task<PostDetailDto?> GetPostByIdAsync(long userId, long postId);

    /// <summary>
    /// Tạo post không có media (backward compatible).
    /// </summary>
    Task<PostDto> CreatePostAsync(long userId, CreatePostDto dto);

    /// <summary>
    /// Tạo post kèm danh sách URL media đã được upload.
    /// </summary>
    Task<PostDto> CreatePostAsync(long userId, CreatePostDto dto, List<(string Url, string MediaType)> mediaFiles);
}
