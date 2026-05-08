namespace SocialNetwork.Domain.Entities;

public class MessageAttachment
{
    public long Id { get; set; }
    public long MessageId { get; set; }

    public string FileUrl { get; set; } = null!;
    public string? FileName { get; set; }
    public long? FileSize { get; set; }

    public string? MimeType { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Message Message { get; set; } = null!;
}
