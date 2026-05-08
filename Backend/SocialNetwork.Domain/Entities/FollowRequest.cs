using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class FollowRequest
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }

    public FollowRequestStatus Status { get; set; } = FollowRequestStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Sender { get; set; } = null!;
    public User Receiver { get; set; } = null!;
}
