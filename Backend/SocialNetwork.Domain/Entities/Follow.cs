namespace SocialNetwork.Domain.Entities;

public class Follow
{
    public long FollowerId { get; set; }
    public long FollowingId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Follower { get; set; } = null!;
    public User Following { get; set; } = null!;
}
