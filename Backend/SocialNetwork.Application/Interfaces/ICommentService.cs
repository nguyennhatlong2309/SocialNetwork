using SocialNetwork.Application.DTOs.Post;

namespace SocialNetwork.Application.Interfaces;

public interface ICommentService
{
    /// <summary>
    /// Thêm comment vào bài post. Tự động tạo thông báo cho chủ post.
    /// </summary>
    Task<CommentDto> AddCommentAsync(long userId, long postId, CreateCommentDto dto);

    /// <summary>
    /// Xóa comment (chỉ chủ comment hoặc chủ post mới được xóa).
    /// </summary>
    Task DeleteCommentAsync(long userId, long commentId);

    /// <summary>
    /// Lấy danh sách comment của post, có phân trang.
    /// </summary>
    Task<IEnumerable<CommentDto>> GetCommentsAsync(long postId, int page, int pageSize);
}
