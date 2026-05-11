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
            // Unlike
            await _likeRepository.DeleteAsync(existingLike);
            post.LikeCount = Math.Max(0, post.LikeCount - 1);
            isLiked = false;
        }
        else
        {
            // Like
            var like = new Like
            {
                UserId = userId,
                PostId = postId,
                CreatedAt = DateTime.UtcNow
            };
            await _likeRepository.AddAsync(like);
            post.LikeCount++;
            isLiked = true;

            // Gửi thông báo cho chủ post (không cần await — fire and forget qua interface)
            await _notificationService.CreateAndPushAsync(new CreateNotificationDto
            {
                SenderId = userId,
                ReceiverId = post.UserId,
                Type = NotificationType.Like,
                ReferenceId = postId,
                Content = "đã thích bài viết của bạn."
            });
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
