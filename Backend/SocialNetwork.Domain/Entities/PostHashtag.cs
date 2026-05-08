namespace SocialNetwork.Domain.Entities;

public class PostHashtag
{
    public long PostId { get; set; }
    public long HashtagId { get; set; }

    // Navigation
    public Post Post { get; set; } = null!;
    public Hashtag Hashtag { get; set; } = null!;
}
