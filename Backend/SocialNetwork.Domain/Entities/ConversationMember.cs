using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class ConversationMember
{
    public long ConversationId { get; set; }
    public long UserId { get; set; }

    public MemberRole Role { get; set; } = MemberRole.Member;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LeftAt { get; set; }

    public bool IsMuted { get; set; }

    // Navigation
    public Conversation Conversation { get; set; } = null!;
    public User User { get; set; } = null!;
}
