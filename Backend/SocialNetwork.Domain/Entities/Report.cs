using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class Report
{
    public long Id { get; set; }
    public long ReporterId { get; set; }

    public long? ReportedUserId { get; set; }
    public long? ReportedPostId { get; set; }
    public long? ReportedCommentId { get; set; }

    public ReportReason Reason { get; set; }
    public string? Description { get; set; }

    public ReportStatus Status { get; set; } = ReportStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Reporter { get; set; } = null!;
    public User? ReportedUser { get; set; }
    public Post? ReportedPost { get; set; }
    public Comment? ReportedComment { get; set; }
}
