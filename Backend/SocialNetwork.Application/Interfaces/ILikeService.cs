using SocialNetwork.Application.DTOs.Post;

namespace SocialNetwork.Application.Interfaces;

public interface ILikeService
{
    /// <summary>
    /// Toggle Like trên bài post. Nếu chưa like → like, nếu đã like → unlike.
    /// Tự động tạo thông báo cho chủ post khi like.
    /// </summary>
    Task<LikeResultDto> ToggleLikeAsync(long userId, long postId);
}
