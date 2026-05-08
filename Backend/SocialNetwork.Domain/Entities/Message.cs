using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Message
{
    public long Id { get; set; }
    public long ConversationId { get; set; }
    public long SenderId { get; set; }

    public long? ReplyToMessageId { get; set; }

    public MessageType MessageType { get; set; } = MessageType.Text;

    public string? Content { get; set; }

    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }

    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? EditedAt { get; set; }

    // Navigation
    public Conversation Conversation { get; set; } = null!;
    public User Sender { get; set; } = null!;
    public Message? ReplyToMessage { get; set; }
    public ICollection<Message> Replies { get; set; } = new List<Message>();
    public ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
    public ICollection<MessageRead> ReadBy { get; set; } = new List<MessageRead>();
}
