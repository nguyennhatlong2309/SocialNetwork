namespace SocialNetwork.Domain.Entities;

public class StoryView
{
    public long StoryId { get; set; }
    public long ViewerId { get; set; }

    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Story Story { get; set; } = null!;
    public User Viewer { get; set; } = null!;
}
