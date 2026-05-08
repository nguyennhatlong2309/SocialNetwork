namespace SocialNetwork.Domain.Entities;

public class Hashtag
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}
