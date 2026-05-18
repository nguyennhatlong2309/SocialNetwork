using Microsoft.EntityFrameworkCore;
using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Infrastructure.Data;

public class SocialNetworkDbContext : DbContext
{
    public SocialNetworkDbContext(DbContextOptions<SocialNetworkDbContext> options)
        : base(options) { }

    // ===== User =====
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();

    // ===== Social =====
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<FollowRequest> FollowRequests => Set<FollowRequest>();
    public DbSet<Block> Blocks => Set<Block>();

    // ===== Posts =====
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostMedia> PostMedia => Set<PostMedia>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Share> Shares => Set<Share>();
    public DbSet<SavedPost> SavedPosts => Set<SavedPost>();

    // ===== Stories =====
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StoryView> StoryViews => Set<StoryView>();

    // ===== Hashtags =====
    public DbSet<Hashtag> Hashtags => Set<Hashtag>();
    public DbSet<PostHashtag> PostHashtags => Set<PostHashtag>();

    // ===== Other =====
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<Notification> Notifications => Set<Notification>();

    // ===== Chat =====
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationMember> ConversationMembers => Set<ConversationMember>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageAttachment> MessageAttachments => Set<MessageAttachment>();
    public DbSet<MessageRead> MessageReads => Set<MessageRead>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===================== USERS =====================
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(u => u.FirstName).HasColumnName("first_name").HasMaxLength(100);
            e.Property(u => u.LastName).HasColumnName("last_name").HasMaxLength(100);
            e.Property(u => u.FullName).HasColumnName("full_name").HasMaxLength(200);
            e.Property(u => u.AvatarUrl).HasColumnName("avatar_url").HasColumnType("text");
            e.Property(u => u.CoverUrl).HasColumnName("cover_url").HasColumnType("text");
            e.Property(u => u.Bio).HasColumnName("bio").HasColumnType("text");
            e.Property(u => u.Gender).HasColumnName("gender").HasConversion<string>().HasMaxLength(10);
            e.Property(u => u.BirthDate).HasColumnName("birth_date");
            e.Property(u => u.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(u => u.Website).HasColumnName("website").HasMaxLength(255);
            e.Property(u => u.Location).HasColumnName("location").HasMaxLength(255);
            e.Property(u => u.IsVerified).HasColumnName("is_verified");
            e.Property(u => u.IsPrivate).HasColumnName("is_private");
            e.Property(u => u.IsActive).HasColumnName("is_active");
            e.Property(u => u.IsBanned).HasColumnName("is_banned");
            e.Property(u => u.LastSeenAt).HasColumnName("last_seen_at");
            e.Property(u => u.CreatedAt).HasColumnName("created_at");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at");

            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ===================== USER SETTINGS =====================
        modelBuilder.Entity<UserSettings>(e =>
        {
            e.ToTable("user_settings");
            e.HasKey(us => us.Id);
            e.Property(us => us.Id).HasColumnName("id");
            e.Property(us => us.UserId).HasColumnName("user_id");
            e.Property(us => us.EmailNotifications).HasColumnName("email_notifications");
            e.Property(us => us.PushNotifications).HasColumnName("push_notifications");
            e.Property(us => us.MessageNotifications).HasColumnName("message_notifications");
            e.Property(us => us.DarkMode).HasColumnName("dark_mode");
            e.Property(us => us.Language).HasColumnName("language").HasMaxLength(20);
            e.Property(us => us.ShowOnlineStatus).HasColumnName("show_online_status");
            e.Property(us => us.AllowTagging).HasColumnName("allow_tagging");
            e.Property(us => us.CreatedAt).HasColumnName("created_at");
            e.Property(us => us.UpdatedAt).HasColumnName("updated_at");

            e.HasIndex(us => us.UserId).IsUnique();
            e.HasOne(us => us.User).WithOne(u => u.UserSettings)
                .HasForeignKey<UserSettings>(us => us.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== REFRESH TOKENS =====================
        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.ToTable("refresh_tokens");
            e.HasKey(rt => rt.Id);
            e.Property(rt => rt.Id).HasColumnName("id");
            e.Property(rt => rt.UserId).HasColumnName("user_id");
            e.Property(rt => rt.Token).HasColumnName("token").HasMaxLength(500).IsRequired();
            e.Property(rt => rt.ExpiresAt).HasColumnName("expires_at");
            e.Property(rt => rt.Revoked).HasColumnName("revoked");
            e.Property(rt => rt.CreatedAt).HasColumnName("created_at");

            e.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== USER SESSIONS =====================
        modelBuilder.Entity<UserSession>(e =>
        {
            e.ToTable("user_sessions");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.UserId).HasColumnName("user_id");
            e.Property(s => s.IpAddress).HasColumnName("ip_address").HasMaxLength(50);
            e.Property(s => s.UserAgent).HasColumnName("user_agent").HasColumnType("text");
            e.Property(s => s.DeviceName).HasColumnName("device_name").HasMaxLength(255);
            e.Property(s => s.LoginAt).HasColumnName("login_at");
            e.Property(s => s.LogoutAt).HasColumnName("logout_at");

            e.HasOne(s => s.User).WithMany(u => u.UserSessions)
                .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== FOLLOWS =====================
        modelBuilder.Entity<Follow>(e =>
        {
            e.ToTable("follows");
            e.HasKey(f => new { f.FollowerId, f.FollowingId });
            e.Property(f => f.FollowerId).HasColumnName("follower_id");
            e.Property(f => f.FollowingId).HasColumnName("following_id");
            e.Property(f => f.CreatedAt).HasColumnName("created_at");

            e.HasOne(f => f.Follower).WithMany(u => u.Following)
                .HasForeignKey(f => f.FollowerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(f => f.Following).WithMany(u => u.Followers)
                .HasForeignKey(f => f.FollowingId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== FOLLOW REQUESTS =====================
        modelBuilder.Entity<FollowRequest>(e =>
        {
            e.ToTable("follow_requests");
            e.HasKey(fr => fr.Id);
            e.Property(fr => fr.Id).HasColumnName("id");
            e.Property(fr => fr.SenderId).HasColumnName("sender_id");
            e.Property(fr => fr.ReceiverId).HasColumnName("receiver_id");
            e.Property(fr => fr.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(10);
            e.Property(fr => fr.CreatedAt).HasColumnName("created_at");

            e.HasOne(fr => fr.Sender).WithMany(u => u.SentFollowRequests)
                .HasForeignKey(fr => fr.SenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(fr => fr.Receiver).WithMany(u => u.ReceivedFollowRequests)
                .HasForeignKey(fr => fr.ReceiverId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== BLOCKS =====================
        modelBuilder.Entity<Block>(e =>
        {
            e.ToTable("blocks");
            e.HasKey(b => new { b.BlockerId, b.BlockedId });
            e.Property(b => b.BlockerId).HasColumnName("blocker_id");
            e.Property(b => b.BlockedId).HasColumnName("blocked_id");
            e.Property(b => b.CreatedAt).HasColumnName("created_at");

            e.HasOne(b => b.Blocker).WithMany(u => u.BlockedUsers)
                .HasForeignKey(b => b.BlockerId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Blocked).WithMany(u => u.BlockedByUsers)
                .HasForeignKey(b => b.BlockedId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== POSTS =====================
        modelBuilder.Entity<Post>(e =>
        {
            e.ToTable("posts");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.UserId).HasColumnName("user_id");
            e.Property(p => p.Content).HasColumnName("content").HasColumnType("text");
            e.Property(p => p.Visibility).HasColumnName("visibility").HasConversion<string>().HasMaxLength(10);
            e.Property(p => p.LikeCount).HasColumnName("like_count");
            e.Property(p => p.CommentCount).HasColumnName("comment_count");
            e.Property(p => p.ShareCount).HasColumnName("share_count");
            e.Property(p => p.IsEdited).HasColumnName("is_edited");
            e.Property(p => p.IsDeleted).HasColumnName("is_deleted");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at");

            e.HasIndex(p => p.UserId);
            e.HasIndex(p => p.CreatedAt);

            e.HasOne(p => p.User).WithMany(u => u.Posts)
                .HasForeignKey(p => p.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== POST MEDIA =====================
        modelBuilder.Entity<PostMedia>(e =>
        {
            e.ToTable("post_media");
            e.HasKey(pm => pm.Id);
            e.Property(pm => pm.Id).HasColumnName("id");
            e.Property(pm => pm.PostId).HasColumnName("post_id");
            e.Property(pm => pm.MediaUrl).HasColumnName("media_url").HasColumnType("text").IsRequired();
            e.Property(pm => pm.MediaType).HasColumnName("media_type").HasConversion<string>().HasMaxLength(10);
            e.Property(pm => pm.CreatedAt).HasColumnName("created_at");

            e.HasOne(pm => pm.Post).WithMany(p => p.Media)
                .HasForeignKey(pm => pm.PostId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== LIKES =====================
        modelBuilder.Entity<Like>(e =>
        {
            e.ToTable("likes");
            e.HasKey(l => new { l.UserId, l.PostId });
            e.Property(l => l.UserId).HasColumnName("user_id");
            e.Property(l => l.PostId).HasColumnName("post_id");
            e.Property(l => l.CreatedAt).HasColumnName("created_at");

            e.HasIndex(l => l.PostId);

            e.HasOne(l => l.User).WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(l => l.Post).WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== COMMENTS =====================
        modelBuilder.Entity<Comment>(e =>
        {
            e.ToTable("comments");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.PostId).HasColumnName("post_id");
            e.Property(c => c.UserId).HasColumnName("user_id");
            e.Property(c => c.ParentCommentId).HasColumnName("parent_comment_id");
            e.Property(c => c.Content).HasColumnName("content").HasColumnType("text").IsRequired();
            e.Property(c => c.LikeCount).HasColumnName("like_count");
            e.Property(c => c.IsEdited).HasColumnName("is_edited");
            e.Property(c => c.IsDeleted).HasColumnName("is_deleted");
            e.Property(c => c.CreatedAt).HasColumnName("created_at");
            e.Property(c => c.UpdatedAt).HasColumnName("updated_at");

            e.HasIndex(c => c.PostId);

            e.HasOne(c => c.Post).WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(c => c.User).WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(c => c.ParentComment).WithMany(c => c.Replies)
                .HasForeignKey(c => c.ParentCommentId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== SHARES =====================
        modelBuilder.Entity<Share>(e =>
        {
            e.ToTable("shares");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.UserId).HasColumnName("user_id");
            e.Property(s => s.PostId).HasColumnName("post_id");
            e.Property(s => s.SharedText).HasColumnName("shared_text").HasColumnType("text");
            e.Property(s => s.CreatedAt).HasColumnName("created_at");

            e.HasOne(s => s.User).WithMany(u => u.Shares)
                .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Post).WithMany(p => p.Shares)
                .HasForeignKey(s => s.PostId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== SAVED POSTS =====================
        modelBuilder.Entity<SavedPost>(e =>
        {
            e.ToTable("saved_posts");
            e.HasKey(sp => new { sp.UserId, sp.PostId });
            e.Property(sp => sp.UserId).HasColumnName("user_id");
            e.Property(sp => sp.PostId).HasColumnName("post_id");
            e.Property(sp => sp.CreatedAt).HasColumnName("created_at");

            e.HasOne(sp => sp.User).WithMany(u => u.SavedPosts)
                .HasForeignKey(sp => sp.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sp => sp.Post).WithMany(p => p.SavedByUsers)
                .HasForeignKey(sp => sp.PostId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== STORIES =====================
        modelBuilder.Entity<Story>(e =>
        {
            e.ToTable("stories");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.UserId).HasColumnName("user_id");
            e.Property(s => s.MediaUrl).HasColumnName("media_url").HasColumnType("text").IsRequired();
            e.Property(s => s.MediaType).HasColumnName("media_type").HasConversion<string>().HasMaxLength(10);
            e.Property(s => s.Caption).HasColumnName("caption").HasColumnType("text");
            e.Property(s => s.ExpiresAt).HasColumnName("expires_at");
            e.Property(s => s.CreatedAt).HasColumnName("created_at");

            e.HasIndex(s => s.ExpiresAt);

            e.HasOne(s => s.User).WithMany(u => u.Stories)
                .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== STORY VIEWS =====================
        modelBuilder.Entity<StoryView>(e =>
        {
            e.ToTable("story_views");
            e.HasKey(sv => new { sv.StoryId, sv.ViewerId });
            e.Property(sv => sv.StoryId).HasColumnName("story_id");
            e.Property(sv => sv.ViewerId).HasColumnName("viewer_id");
            e.Property(sv => sv.ViewedAt).HasColumnName("viewed_at");

            e.HasOne(sv => sv.Story).WithMany(s => s.Views)
                .HasForeignKey(sv => sv.StoryId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sv => sv.Viewer).WithMany(u => u.StoryViews)
                .HasForeignKey(sv => sv.ViewerId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== HASHTAGS =====================
        modelBuilder.Entity<Hashtag>(e =>
        {
            e.ToTable("hashtags");
            e.HasKey(h => h.Id);
            e.Property(h => h.Id).HasColumnName("id");
            e.Property(h => h.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(h => h.CreatedAt).HasColumnName("created_at");

            e.HasIndex(h => h.Name).IsUnique();
        });

        // ===================== POST HASHTAGS =====================
        modelBuilder.Entity<PostHashtag>(e =>
        {
            e.ToTable("post_hashtags");
            e.HasKey(ph => new { ph.PostId, ph.HashtagId });
            e.Property(ph => ph.PostId).HasColumnName("post_id");
            e.Property(ph => ph.HashtagId).HasColumnName("hashtag_id");

            e.HasOne(ph => ph.Post).WithMany(p => p.PostHashtags)
                .HasForeignKey(ph => ph.PostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ph => ph.Hashtag).WithMany(h => h.PostHashtags)
                .HasForeignKey(ph => ph.HashtagId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== REPORTS =====================
        modelBuilder.Entity<Report>(e =>
        {
            e.ToTable("reports");
            e.HasKey(r => r.Id);
            e.Property(r => r.Id).HasColumnName("id");
            e.Property(r => r.ReporterId).HasColumnName("reporter_id");
            e.Property(r => r.ReportedUserId).HasColumnName("reported_user_id");
            e.Property(r => r.ReportedPostId).HasColumnName("reported_post_id");
            e.Property(r => r.ReportedCommentId).HasColumnName("reported_comment_id");
            e.Property(r => r.Reason).HasColumnName("reason").HasConversion<string>().HasMaxLength(20);
            e.Property(r => r.Description).HasColumnName("description").HasColumnType("text");
            e.Property(r => r.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(10);
            e.Property(r => r.CreatedAt).HasColumnName("created_at");

            e.HasOne(r => r.Reporter).WithMany(u => u.FiledReports)
                .HasForeignKey(r => r.ReporterId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.ReportedUser).WithMany()
                .HasForeignKey(r => r.ReportedUserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.ReportedPost).WithMany()
                .HasForeignKey(r => r.ReportedPostId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.ReportedComment).WithMany()
                .HasForeignKey(r => r.ReportedCommentId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== NOTIFICATIONS =====================
        modelBuilder.Entity<Notification>(e =>
        {
            e.ToTable("notifications");
            e.HasKey(n => n.Id);
            e.Property(n => n.Id).HasColumnName("id");
            e.Property(n => n.SenderId).HasColumnName("sender_id");
            e.Property(n => n.ReceiverId).HasColumnName("receiver_id");
            e.Property(n => n.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(10);
            e.Property(n => n.ReferenceId).HasColumnName("reference_id");
            e.Property(n => n.Content).HasColumnName("content").HasColumnType("text");
            e.Property(n => n.IsRead).HasColumnName("is_read");
            e.Property(n => n.CreatedAt).HasColumnName("created_at");
            e.Property(n => n.UpdatedAt).HasColumnName("updated_at");  // Grouping timestamp

            // Index chính để lookup nhanh thông báo gom nhóm
            e.HasIndex(n => n.ReceiverId);
            e.HasIndex(n => new { n.ReceiverId, n.Type, n.ReferenceId })
                .HasDatabaseName("IX_notifications_grouped");

            e.HasOne(n => n.Sender).WithMany(u => u.SentNotifications)
                .HasForeignKey(n => n.SenderId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(n => n.Receiver).WithMany(u => u.ReceivedNotifications)
                .HasForeignKey(n => n.ReceiverId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== CONVERSATIONS =====================
        modelBuilder.Entity<Conversation>(e =>
        {
            e.ToTable("conversations");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(10);
            e.Property(c => c.Name).HasColumnName("name").HasMaxLength(255);
            e.Property(c => c.AvatarUrl).HasColumnName("avatar_url").HasColumnType("text");
            e.Property(c => c.CreatedBy).HasColumnName("created_by");
            e.Property(c => c.LastMessageId).HasColumnName("last_message_id");
            e.Property(c => c.CreatedAt).HasColumnName("created_at");
            e.Property(c => c.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(c => c.Creator).WithMany(u => u.CreatedConversations)
                .HasForeignKey(c => c.CreatedBy).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(c => c.LastMessage).WithMany()
                .HasForeignKey(c => c.LastMessageId).OnDelete(DeleteBehavior.SetNull);
        });

        // ===================== CONVERSATION MEMBERS =====================
        modelBuilder.Entity<ConversationMember>(e =>
        {
            e.ToTable("conversation_members");
            e.HasKey(cm => new { cm.ConversationId, cm.UserId });
            e.Property(cm => cm.ConversationId).HasColumnName("conversation_id");
            e.Property(cm => cm.UserId).HasColumnName("user_id");
            e.Property(cm => cm.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(10);
            e.Property(cm => cm.JoinedAt).HasColumnName("joined_at");
            e.Property(cm => cm.LeftAt).HasColumnName("left_at");
            e.Property(cm => cm.IsMuted).HasColumnName("is_muted");

            e.HasOne(cm => cm.Conversation).WithMany(c => c.Members)
                .HasForeignKey(cm => cm.ConversationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(cm => cm.User).WithMany(u => u.ConversationMemberships)
                .HasForeignKey(cm => cm.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== MESSAGES =====================
        modelBuilder.Entity<Message>(e =>
        {
            e.ToTable("messages");
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).HasColumnName("id");
            e.Property(m => m.ConversationId).HasColumnName("conversation_id");
            e.Property(m => m.SenderId).HasColumnName("sender_id");
            e.Property(m => m.ReplyToMessageId).HasColumnName("reply_to_message_id");
            e.Property(m => m.MessageType).HasColumnName("message_type").HasConversion<string>().HasMaxLength(10);
            e.Property(m => m.Content).HasColumnName("content").HasColumnType("text");
            e.Property(m => m.IsEdited).HasColumnName("is_edited");
            e.Property(m => m.IsDeleted).HasColumnName("is_deleted");
            e.Property(m => m.SentAt).HasColumnName("sent_at");
            e.Property(m => m.EditedAt).HasColumnName("edited_at");

            e.HasIndex(m => m.ConversationId);
            e.HasIndex(m => m.SenderId);
            e.HasIndex(m => m.SentAt);

            e.HasOne(m => m.Conversation).WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Sender).WithMany(u => u.Messages)
                .HasForeignKey(m => m.SenderId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.ReplyToMessage).WithMany(m => m.Replies)
                .HasForeignKey(m => m.ReplyToMessageId).OnDelete(DeleteBehavior.SetNull);
        });

        // ===================== MESSAGE ATTACHMENTS =====================
        modelBuilder.Entity<MessageAttachment>(e =>
        {
            e.ToTable("message_attachments");
            e.HasKey(ma => ma.Id);
            e.Property(ma => ma.Id).HasColumnName("id");
            e.Property(ma => ma.MessageId).HasColumnName("message_id");
            e.Property(ma => ma.FileUrl).HasColumnName("file_url").HasColumnType("text").IsRequired();
            e.Property(ma => ma.FileName).HasColumnName("file_name").HasMaxLength(255);
            e.Property(ma => ma.FileSize).HasColumnName("file_size");
            e.Property(ma => ma.MimeType).HasColumnName("mime_type").HasMaxLength(100);
            e.Property(ma => ma.CreatedAt).HasColumnName("created_at");

            e.HasOne(ma => ma.Message).WithMany(m => m.Attachments)
                .HasForeignKey(ma => ma.MessageId).OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== MESSAGE READS =====================
        modelBuilder.Entity<MessageRead>(e =>
        {
            e.ToTable("message_reads");
            e.HasKey(mr => new { mr.MessageId, mr.UserId });
            e.Property(mr => mr.MessageId).HasColumnName("message_id");
            e.Property(mr => mr.UserId).HasColumnName("user_id");
            e.Property(mr => mr.ReadAt).HasColumnName("read_at");

            e.HasOne(mr => mr.Message).WithMany(m => m.ReadBy)
                .HasForeignKey(mr => mr.MessageId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(mr => mr.User).WithMany(u => u.MessageReads)
                .HasForeignKey(mr => mr.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
