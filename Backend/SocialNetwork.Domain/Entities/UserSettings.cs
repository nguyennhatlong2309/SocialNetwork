namespace SocialNetwork.Domain.Entities;

public class UserSettings
{
    public long Id { get; set; }
    public long UserId { get; set; }

    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool MessageNotifications { get; set; } = true;

    public bool DarkMode { get; set; }
    public string Language { get; set; } = "vi";

    public bool ShowOnlineStatus { get; set; } = true;
    public bool AllowTagging { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
}
