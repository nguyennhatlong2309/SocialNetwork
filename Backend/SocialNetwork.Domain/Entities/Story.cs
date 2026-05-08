using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Story
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public string MediaUrl { get; set; } = null!;
    public MediaType MediaType { get; set; } = MediaType.Image;

    public string? Caption { get; set; }

    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<StoryView> Views { get; set; } = new List<StoryView>();
}
