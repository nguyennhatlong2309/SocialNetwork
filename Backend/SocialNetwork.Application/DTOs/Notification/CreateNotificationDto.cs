using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.DTOs.Notification;

public class CreateNotificationDto
{
    public long? SenderId { get; set; }
    public long ReceiverId { get; set; }
    public NotificationType Type { get; set; }
    public long? ReferenceId { get; set; }
    public string? Content { get; set; }
}
