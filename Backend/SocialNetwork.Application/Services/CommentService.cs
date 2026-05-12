using AutoMapper;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class CommentService : ICommentService
{
    private readonly IRepository<Comment> _commentRepository;
    private readonly IPostRepository _postRepository;
    private readonly INotificationService _notificationService;
    private readonly IMapper _mapper;

    public CommentService(
        IRepository<Comment> commentRepository,
        IPostRepository postRepository,
        INotificationService notificationService,
        IMapper mapper)
    {
        _commentRepository = commentRepository;
        _postRepository = postRepository;
        _notificationService = notificationService;
        _mapper = mapper;
    }

    public async Task<CommentDto> AddCommentAsync(long userId, long postId, CreateCommentDto dto)
    {
        var post = await _postRepository.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException($"Post {postId} not found.");

        var comment = new Comment
        {
            PostId = postId,
            UserId = userId,
            Content = dto.Content,
            ParentCommentId = dto.ParentCommentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _commentRepository.AddAsync(comment);

        // Cập nhật CommentCount trên post
        post.CommentCount++;
        await _postRepository.UpdateAsync(post);

        // Gửi thông báo cho chủ post
        await _notificationService.CreateAndPushAsync(new CreateNotificationDto
        {
            SenderId = userId,
            ReceiverId = post.UserId,
            Type = NotificationType.Comment,
            ReferenceId = postId,
            Content = "đã bình luận về bài viết của bạn."
        });

        // Reload comment với thông tin user
        var created = await _commentRepository.Query()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == comment.Id);

        return _mapper.Map<CommentDto>(created ?? comment);
    }

    public async Task DeleteCommentAsync(long userId, long commentId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId)
            ?? throw new KeyNotFoundException($"Comment {commentId} not found.");

        // Lấy post để kiểm tra quyền
        var post = await _postRepository.GetByIdAsync(comment.PostId);

        bool isOwner = comment.UserId == userId;
        bool isPostOwner = post?.UserId == userId;

        if (!isOwner && !isPostOwner)
            throw new UnauthorizedAccessException("You cannot delete this comment.");

        comment.IsDeleted = true;
        await _commentRepository.UpdateAsync(comment);

        if (post != null)
        {
            post.CommentCount = Math.Max(0, post.CommentCount - 1);
            await _postRepository.UpdateAsync(post);
        }
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsAsync(long postId, int page, int pageSize)
    {
        var paged = await _commentRepository.Query()
            .Include(c => c.User)
            .Where(c => c.PostId == postId && !c.IsDeleted)
            .OrderBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return _mapper.Map<IEnumerable<CommentDto>>(paged);
    }
}
