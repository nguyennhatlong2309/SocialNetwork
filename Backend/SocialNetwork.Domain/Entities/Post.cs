using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Post
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public string? Content { get; set; }

    public VisibilityType Visibility { get; set; } = VisibilityType.Public;

    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ShareCount { get; set; }

    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<PostMedia> Media { get; set; } = new List<PostMedia>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Share> Shares { get; set; } = new List<Share>();
    public ICollection<SavedPost> SavedByUsers { get; set; } = new List<SavedPost>();
    public ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
}
