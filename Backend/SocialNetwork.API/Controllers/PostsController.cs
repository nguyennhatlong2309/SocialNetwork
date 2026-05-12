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
    private readonly ILikeService _likeService;
    private readonly ICommentService _commentService;
    private readonly IFileStorageService _fileStorageService;

    public PostsController(
        IPostService postService,
        ILikeService likeService,
        ICommentService commentService,
        IFileStorageService fileStorageService)
    {
        _postService = postService;
        _likeService = likeService;
        _commentService = commentService;
        _fileStorageService = fileStorageService;
    }

    private long CurrentUserId =>
        long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Get paginated list of posts with user info and like/comment counts
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var posts = await _postService.GetPostsAsync(CurrentUserId, page, pageSize);
        return Ok(ApiResponse<IEnumerable<PostDto>>.SuccessResponse(posts));
    }

    /// <summary>
    /// Get a single post by ID with full details including comments
    /// </summary>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetPost(long id)
    {
        var post = await _postService.GetPostByIdAsync(CurrentUserId, id);
        if (post == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Post not found."));

        return Ok(ApiResponse<PostDetailDto>.SuccessResponse(post));
    }

    /// <summary>
    /// Tạo bài post mới. Hỗ trợ upload nhiều ảnh/video qua multipart/form-data.
    /// Fields: Content (string), Visibility (string), MediaFiles (file[])
    /// </summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreatePost(
        [FromForm] CreatePostDto dto,
        [FromForm] List<IFormFile>? MediaFiles)
    {
        // Validate: phải có nội dung hoặc ít nhất 1 file
        if (string.IsNullOrWhiteSpace(dto.Content) && (MediaFiles == null || MediaFiles.Count == 0))
            return BadRequest(ApiResponse<object>.ErrorResponse(
                "Post must have text content or at least one media file."));

        // Upload từng file và thu thập URLs
        var mediaList = new List<(string Url, string MediaType)>();
        if (MediaFiles != null && MediaFiles.Count > 0)
        {
            foreach (var file in MediaFiles)
            {
                try
                {
                    // Mở stream từ IFormFile để truyền vào service (Stream-based interface)
                    await using var stream = file.OpenReadStream();
                    var url = await _fileStorageService.SaveFileAsync(
                        stream, file.FileName, file.ContentType, "posts");
                    mediaList.Add((url, file.ContentType));
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        $"File '{file.FileName}': {ex.Message}"));
                }
            }
        }

        var post = await _postService.CreatePostAsync(CurrentUserId, dto, mediaList);
        return CreatedAtAction(nameof(GetPost), new { id = post.Id },
            ApiResponse<PostDto>.SuccessResponse(post, "Post created successfully."));
    }

    /// <summary>
    /// Toggle like trên bài post. Tự động gửi thông báo real-time cho chủ post.
    /// </summary>
    [HttpPost("{id:long}/like")]
    public async Task<IActionResult> ToggleLike(long id)
    {
        var result = await _likeService.ToggleLikeAsync(CurrentUserId, id);
        return Ok(ApiResponse<LikeResultDto>.SuccessResponse(result));
    }

    /// <summary>
    /// Lấy danh sách comments của post (phân trang).
    /// </summary>
    [HttpGet("{id:long}/comments")]
    public async Task<IActionResult> GetComments(
        long id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var comments = await _commentService.GetCommentsAsync(id, page, pageSize);
        return Ok(ApiResponse<IEnumerable<CommentDto>>.SuccessResponse(comments));
    }

    /// <summary>
    /// Thêm comment vào bài post. Tự động gửi thông báo real-time cho chủ post.
    /// </summary>
    [HttpPost("{id:long}/comments")]
    public async Task<IActionResult> AddComment(long id, [FromBody] CreateCommentDto dto)
    {
        var comment = await _commentService.AddCommentAsync(CurrentUserId, id, dto);
        return Ok(ApiResponse<CommentDto>.SuccessResponse(comment, "Comment added."));
    }

    /// <summary>
    /// Xóa comment.
    /// </summary>
    [HttpDelete("{postId:long}/comments/{commentId:long}")]
    public async Task<IActionResult> DeleteComment(long postId, long commentId)
    {
        await _commentService.DeleteCommentAsync(CurrentUserId, commentId);
        return Ok(ApiResponse<object>.SuccessResponse((object?)null, "Comment deleted."));
    }
}

