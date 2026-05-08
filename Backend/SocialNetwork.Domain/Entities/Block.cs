namespace SocialNetwork.Domain.Entities;

public class Block
{
    public long BlockerId { get; set; }
    public long BlockedId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Blocker { get; set; } = null!;
    public User Blocked { get; set; } = null!;
}
