namespace SocialNetwork.Application.DTOs.Notification;

public class NotificationDto
{
    public long Id { get; set; }
    public long? SenderId { get; set; }
    public string? SenderName { get; set; }
    public string? SenderAvatar { get; set; }
    public long ReceiverId { get; set; }
    public string Type { get; set; } = string.Empty;
    public long? ReferenceId { get; set; }
    public string? Content { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
