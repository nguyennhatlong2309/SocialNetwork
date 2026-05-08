namespace SocialNetwork.Domain.Entities;

public class UserSession
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceName { get; set; }

    public DateTime LoginAt { get; set; } = DateTime.UtcNow;
    public DateTime? LogoutAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}
