using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class PostMedia
{
    public long Id { get; set; }
    public long PostId { get; set; }

    public string MediaUrl { get; set; } = null!;
    public MediaType MediaType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Post Post { get; set; } = null!;
}
