using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Conversation
{
    public long Id { get; set; }

    public ConversationType Type { get; set; } = ConversationType.Private;

    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }

    public long? CreatedBy { get; set; }
    public long? LastMessageId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Creator { get; set; }
    public Message? LastMessage { get; set; }
    public ICollection<ConversationMember> Members { get; set; } = new List<ConversationMember>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
