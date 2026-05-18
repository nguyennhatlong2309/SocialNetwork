using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Domain.Entities;

public class User
{
    public long Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }

    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? Bio { get; set; }

    public GenderType Gender { get; set; } = GenderType.Other;

    public DateOnly? BirthDate { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }

    public bool IsVerified { get; set; }
    public bool IsPrivate { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsBanned { get; set; }
    public UserRole Role { get; set; } = UserRole.Member;

    public DateTime? LastSeenAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public UserSettings? UserSettings { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<UserSession> UserSessions { get; set; } = new List<UserSession>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Story> Stories { get; set; } = new List<Story>();
    public ICollection<Share> Shares { get; set; } = new List<Share>();
    public ICollection<Notification> SentNotifications { get; set; } = new List<Notification>();
    public ICollection<Notification> ReceivedNotifications { get; set; } = new List<Notification>();
    public ICollection<Conversation> CreatedConversations { get; set; } = new List<Conversation>();
    public ICollection<ConversationMember> ConversationMemberships { get; set; } = new List<ConversationMember>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<Report> FiledReports { get; set; } = new List<Report>();

    // Many-to-many via join entities
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Following { get; set; } = new List<Follow>();
    public ICollection<Block> BlockedUsers { get; set; } = new List<Block>();
    public ICollection<Block> BlockedByUsers { get; set; } = new List<Block>();
    public ICollection<FollowRequest> SentFollowRequests { get; set; } = new List<FollowRequest>();
    public ICollection<FollowRequest> ReceivedFollowRequests { get; set; } = new List<FollowRequest>();
    public ICollection<StoryView> StoryViews { get; set; } = new List<StoryView>();
    public ICollection<MessageRead> MessageReads { get; set; } = new List<MessageRead>();
}
