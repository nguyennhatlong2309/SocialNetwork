namespace SocialNetwork.Domain.Entities;

public class Comment
{
    public long Id { get; set; }
    public long PostId { get; set; }
    public long UserId { get; set; }
    public long? ParentCommentId { get; set; }

    public string Content { get; set; } = null!;

    public int LikeCount { get; set; }

    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Post Post { get; set; } = null!;
    public User User { get; set; } = null!;
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
}
