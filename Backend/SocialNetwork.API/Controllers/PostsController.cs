using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.DTOs.Common;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    /// <summary>
    /// Get paginated list of posts with user info and like/comment counts
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var posts = await _postService.GetPostsAsync(page, pageSize);
        return Ok(ApiResponse<IEnumerable<PostDto>>.SuccessResponse(posts));
    }

    /// <summary>
    /// Get a single post by ID with full details including comments
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(long id)
    {
        var post = await _postService.GetPostByIdAsync(id);
        if (post == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Post not found."));

        return Ok(ApiResponse<PostDetailDto>.SuccessResponse(post));
    }

    /// <summary>
    /// Create a new post
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var post = await _postService.CreatePostAsync(userId, dto);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id },
            ApiResponse<PostDto>.SuccessResponse(post, "Post created."));
    }
}
