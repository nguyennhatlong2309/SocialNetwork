using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.DTOs.User;
using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Should ideally be [Authorize(Roles = "Admin")] if Role existed
public class AdminController : ControllerBase
{
    private readonly IUserService _userService;

    public AdminController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        var users = await _userService.GetAllAdminUsersAsync();
        return Ok(users);
    }

    [HttpPost("users/{userId}/ban")]
    public async Task<ActionResult> BanUser(long userId)
    {
        var success = await _userService.BanUserAsync(userId);
        if (!success) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User banned successfully" });
    }

    [HttpPost("users/{userId}/unban")]
    public async Task<ActionResult> UnbanUser(long userId)
    {
        var success = await _userService.UnbanUserAsync(userId);
        if (!success) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User unbanned successfully" });
    }

    [HttpPost("users/{userId}/promote")]
    public async Task<ActionResult> PromoteToAdmin(long userId)
    {
        var success = await _userService.PromoteToAdminAsync(userId);
        if (!success) return NotFound(new { message = "User not found" });
        return Ok(new { message = "User promoted to admin successfully" });
    }
}
