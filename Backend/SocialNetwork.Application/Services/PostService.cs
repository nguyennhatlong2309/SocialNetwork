using AutoMapper;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class PostService : IPostService
{
    private readonly IPostRepository _postRepository;
    private readonly IMapper _mapper;

    public PostService(IPostRepository postRepository, IMapper mapper)
    {
        _postRepository = postRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PostDto>> GetPostsAsync(int page, int pageSize)
    {
        var posts = await _postRepository.GetPostsWithDetailsAsync(page, pageSize);
        return _mapper.Map<IEnumerable<PostDto>>(posts);
    }

    public async Task<PostDetailDto?> GetPostByIdAsync(long postId)
    {
        var post = await _postRepository.GetPostWithDetailsAsync(postId);
        if (post == null) return null;
        return _mapper.Map<PostDetailDto>(post);
    }

    public async Task<PostDto> CreatePostAsync(long userId, CreatePostDto dto)
    {
        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            Visibility = Enum.Parse<VisibilityType>(dto.Visibility, ignoreCase: true),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _postRepository.AddAsync(post);

        // Reload with user info
        var createdPost = await _postRepository.GetPostWithDetailsAsync(post.Id);
        return _mapper.Map<PostDto>(createdPost);
    }
}
