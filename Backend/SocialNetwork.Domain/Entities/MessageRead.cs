namespace SocialNetwork.Domain.Entities;

public class MessageRead
{
    public long MessageId { get; set; }
    public long UserId { get; set; }

    public DateTime ReadAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Message Message { get; set; } = null!;
    public User User { get; set; } = null!;
}
