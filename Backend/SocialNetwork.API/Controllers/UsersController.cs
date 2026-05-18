using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.DTOs.User;
using System.Security.Claims;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPostService _postService;

    public UsersController(IUserService userService, IPostService postService)
    {
        _userService = userService;
        _postService = postService;
    }

    private long GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpGet("{id}/profile")]
    public async Task<ActionResult<UserProfileDto>> GetProfile(long id)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        var profile = await _userService.GetUserProfileAsync(currentUserId, id);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    [HttpGet("suggested")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetSuggested([FromQuery] int count = 10)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        var users = await _userService.GetSuggestedUsersAsync(currentUserId, count);
        return Ok(users);
    }

    [HttpPost("{id}/follow")]
    public async Task<ActionResult> ToggleFollow(long id)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        try
        {
            var isFollowing = await _userService.ToggleFollowAsync(currentUserId, id);
            return Ok(new { IsFollowing = isFollowing });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpGet("{id}/posts")]
    public async Task<ActionResult<IEnumerable<PostDto>>> GetUserPosts(long id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        var posts = await _postService.GetUserPostsAsync(currentUserId, id, page, pageSize);
        return Ok(posts);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers([FromQuery] string q, [FromQuery] int count = 10)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == 0) return Unauthorized();

        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<UserDto>());

        var users = await _userService.SearchUsersAsync(q, count);
        return Ok(users);
    }
}
