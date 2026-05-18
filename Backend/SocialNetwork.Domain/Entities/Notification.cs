using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Notification
{
    public long Id { get; set; }
    public long? SenderId { get; set; }
    public long ReceiverId { get; set; }

    public NotificationType Type { get; set; }

    public long? ReferenceId { get; set; }
    public string? Content { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Cập nhật mỗi khi thông báo bị gom nhóm (like mới / unlike rồi like lại).
    /// Dùng làm timestamp hiển thị trên UI.
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Sender { get; set; }
    public User Receiver { get; set; } = null!;
}
