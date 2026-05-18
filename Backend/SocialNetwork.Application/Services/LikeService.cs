using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class LikeService : ILikeService
{
    private readonly IRepository<Like> _likeRepository;
    private readonly IPostRepository _postRepository;
    private readonly INotificationService _notificationService;

    public LikeService(
        IRepository<Like> likeRepository,
        IPostRepository postRepository,
        INotificationService notificationService)
    {
        _likeRepository = likeRepository;
        _postRepository = postRepository;
        _notificationService = notificationService;
    }

    public async Task<LikeResultDto> ToggleLikeAsync(long userId, long postId)
    {
        var post = await _postRepository.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException($"Post {postId} not found.");

        var existingLikes = await _likeRepository.FindAsync(
            l => l.UserId == userId && l.PostId == postId);

        var existingLike = existingLikes.FirstOrDefault();
        bool isLiked;

        if (existingLike != null)
        {
            // ── Unlike ────────────────────────────────────────────────────
            await _likeRepository.DeleteAsync(existingLike);
            post.LikeCount = Math.Max(0, post.LikeCount - 1);
            isLiked = false;

            if (post.LikeCount == 0)
            {
                // Không còn ai thích → xóa thông báo hẳn
                await _notificationService.DeleteNotificationAsync(
                    post.UserId, NotificationType.Like, postId);
            }
            else
            {
                // Vẫn còn người khác đã like → cập nhật lại thông báo với người like gần nhất
                // (Tìm người like gần nhất trong DB để làm SenderId mới)
                var latestLike = (await _likeRepository.FindAsync(l => l.PostId == postId))
                    .OrderByDescending(l => l.CreatedAt)
                    .FirstOrDefault();

                if (latestLike != null)
                {
                    await _notificationService.CreateOrUpdateAndPushAsync(
                        new CreateNotificationDto
                        {
                            SenderId = latestLike.UserId,
                            ReceiverId = post.UserId,
                            Type = NotificationType.Like,
                            ReferenceId = postId,
                            Content = "đã thích bài viết của bạn."
                        },
                        actorCount: post.LikeCount);
                }
            }
        }
        else
        {
            // ── Like ──────────────────────────────────────────────────────
            var like = new Like
            {
                UserId = userId,
                PostId = postId,
                CreatedAt = DateTime.UtcNow
            };
            await _likeRepository.AddAsync(like);
            post.LikeCount++;
            isLiked = true;

            // Gom nhóm thông báo: Upsert theo (ReceiverId=post.UserId, Type=Like, ReferenceId=postId)
            await _notificationService.CreateOrUpdateAndPushAsync(
                new CreateNotificationDto
                {
                    SenderId = userId,
                    ReceiverId = post.UserId,
                    Type = NotificationType.Like,
                    ReferenceId = postId,
                    Content = "đã thích bài viết của bạn."
                },
                actorCount: post.LikeCount);
        }

        await _postRepository.UpdateAsync(post);

        return new LikeResultDto
        {
            PostId = postId,
            IsLiked = isLiked,
            TotalLikes = post.LikeCount
        };
    }
}
