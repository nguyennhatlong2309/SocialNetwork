using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SocialNetwork.Application.DTOs.Common;
using SocialNetwork.Application.DTOs.Notification;
using SocialNetwork.Application.Interfaces;

namespace SocialNetwork.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    private long CurrentUserId =>
        long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Lấy danh sách thông báo của user hiện tại (phân trang).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var notifications = await _notificationService
            .GetNotificationsAsync(CurrentUserId, page, pageSize);

        return Ok(ApiResponse<IEnumerable<NotificationDto>>.SuccessResponse(notifications));
    }

    /// <summary>
    /// Đếm số thông báo chưa đọc.
    /// </summary>
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _notificationService.GetUnreadCountAsync(CurrentUserId);
        return Ok(ApiResponse<int>.SuccessResponse(count));
    }

    /// <summary>
    /// Đánh dấu một thông báo là đã đọc.
    /// </summary>
    [HttpPatch("{id:long}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        await _notificationService.MarkAsReadAsync(id, CurrentUserId);
        return Ok(ApiResponse<object>.SuccessResponse((object?)null, "Notification marked as read."));
    }

    /// <summary>
    /// Đánh dấu tất cả thông báo là đã đọc.
    /// </summary>
    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationService.MarkAllAsReadAsync(CurrentUserId);
        return Ok(ApiResponse<object>.SuccessResponse((object?)null, "All notifications marked as read."));
    }
}
