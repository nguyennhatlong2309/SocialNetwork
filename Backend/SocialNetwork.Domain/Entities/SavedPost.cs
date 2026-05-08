namespace SocialNetwork.Domain.Entities;

public class SavedPost
{
    public long UserId { get; set; }
    public long PostId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public Post Post { get; set; } = null!;
}
