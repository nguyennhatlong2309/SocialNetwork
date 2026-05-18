using AutoMapper;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IRepository<Like> _likeRepository;
    private readonly IMapper _mapper;

    public PostService(IPostRepository postRepository, IRepository<Like> likeRepository, IMapper mapper)
    {
        _postRepository = postRepository;
        _likeRepository = likeRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PostDto>> GetPostsAsync(long userId, int page, int pageSize)
    {
        var posts = await _postRepository.GetPostsWithDetailsAsync(page, pageSize);
        var dtos = _mapper.Map<IEnumerable<PostDto>>(posts).ToList();

        var postIds = dtos.Select(d => d.Id).ToList();
        var likes = await _likeRepository.FindAsync(l => l.UserId == userId && postIds.Contains(l.PostId));
        var likedPostIds = likes.Select(l => l.PostId).ToHashSet();

        foreach (var dto in dtos)
        {
            dto.IsLiked = likedPostIds.Contains(dto.Id);
        }

        return dtos;
    }

    public async Task<IEnumerable<PostDto>> GetUserPostsAsync(long currentUserId, long authorId, int page, int pageSize)
    {
        var posts = await _postRepository.GetUserPostsAsync(authorId, page, pageSize);
        var dtos = _mapper.Map<IEnumerable<PostDto>>(posts).ToList();

        var postIds = dtos.Select(d => d.Id).ToList();
        var likes = await _likeRepository.FindAsync(l => l.UserId == currentUserId && postIds.Contains(l.PostId));
        var likedPostIds = likes.Select(l => l.PostId).ToHashSet();

        foreach (var dto in dtos)
        {
            dto.IsLiked = likedPostIds.Contains(dto.Id);
        }

        return dtos;
    }

    public async Task<PostDetailDto?> GetPostByIdAsync(long userId, long postId)
    {
        var post = await _postRepository.GetPostWithDetailsAsync(postId);
        if (post == null) return null;
        
        var dto = _mapper.Map<PostDetailDto>(post);
        var likes = await _likeRepository.FindAsync(l => l.UserId == userId && l.PostId == postId);
        dto.IsLiked = likes.Any();
        
        return dto;
    }

    // Backward-compatible: không có media
    public Task<PostDto> CreatePostAsync(long userId, CreatePostDto dto)
        => CreatePostAsync(userId, dto, new List<(string Url, string MediaType)>());

    // Main implementation: hỗ trợ media
    public async Task<PostDto> CreatePostAsync(
        long userId,
        CreatePostDto dto,
        List<(string Url, string MediaType)> mediaFiles)
    {
        // Validate: phải có content hoặc ít nhất 1 file media
        if (string.IsNullOrWhiteSpace(dto.Content) && mediaFiles.Count == 0)
            throw new ArgumentException("Post must have content or at least one media file.");

        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            Visibility = Enum.Parse<VisibilityType>(dto.Visibility, ignoreCase: true),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Gắn media vào post trước khi save (EF Core sẽ insert cùng lúc)
        foreach (var (url, mediaTypeStr) in mediaFiles)
        {
            var mediaType = mediaTypeStr.StartsWith("video", StringComparison.OrdinalIgnoreCase)
                ? MediaType.Video
                : MediaType.Image;

            post.Media.Add(new PostMedia
            {
                MediaUrl = url,
                MediaType = mediaType,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _postRepository.AddAsync(post);

        // Reload với đầy đủ thông tin user và media để map sang DTO
        var createdPost = await _postRepository.GetPostWithDetailsAsync(post.Id);
        return _mapper.Map<PostDto>(createdPost!);
    }
}

