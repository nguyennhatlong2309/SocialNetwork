using System.ComponentModel.DataAnnotations;
using SocialNetwork.Application.DTOs.User;

namespace SocialNetwork.Application.DTOs.Message;

public class MessageDto
{
    public long Id { get; set; }
    public long ConversationId { get; set; }
    public string? Content { get; set; }
    public string MessageType { get; set; } = null!;
    public bool IsEdited { get; set; }
    public DateTime SentAt { get; set; }
    public long? ReplyToMessageId { get; set; }

    public UserDto Sender { get; set; } = null!;
    public List<MessageAttachmentDto> Attachments { get; set; } = new();
}

public class MessageAttachmentDto
{
    public long Id { get; set; }
    public string FileUrl { get; set; } = null!;
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
}

public class SendMessageDto
{
    [Required]
    public long ConversationId { get; set; }

    public string? Content { get; set; }

    public string MessageType { get; set; } = "text";

    public long? ReplyToMessageId { get; set; }
}

public class ConversationDto
{
    public long Id { get; set; }
    public string Type { get; set; } = null!;
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime UpdatedAt { get; set; }

    public MessageDto? LastMessage { get; set; }
    public List<ConversationMemberDto> Members { get; set; } = new();
}

public class ConversationMemberDto
{
    public long UserId { get; set; }
    public string Username { get; set; } = null!;
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = null!;
}
