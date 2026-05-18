using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Infrastructure.Data;
using BCrypt.Net;

namespace SocialNetwork.API.Extensions;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<SocialNetworkDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseSeeder");

        try
        {
            await context.Database.EnsureCreatedAsync();

            if (await context.Users.AnyAsync())
            {
                logger.LogInformation("Database already seeded. Checking for extra users...");
                if (!await context.Users.AnyAsync(u => u.Username == "james_w"))
                {
                    logger.LogInformation("Seeding extra users...");
                    var extraUsers = new List<User>
                    {
                        new User { Username = "james_w", Email = "james@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "James", LastName = "W.", FullName = "James W.", AvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80", Bio = "Software Engineer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "sarah_j", Email = "sarah@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Sarah", LastName = "J.", FullName = "Sarah J.", AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80", Bio = "Product Manager", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "david_k", Email = "david@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "David", LastName = "K.", FullName = "David K.", AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80", Bio = "Data Scientist", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "emma_t", Email = "emma@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Emma", LastName = "T.", FullName = "Emma T.", AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80", Bio = "Graphic Designer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "michael_b", Email = "michael@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Michael", LastName = "B.", FullName = "Michael B.", AvatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80", Bio = "DevOps Engineer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "olivia_h", Email = "olivia@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Olivia", LastName = "H.", FullName = "Olivia H.", AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80", Bio = "Marketing Specialist", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "william_p", Email = "william@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "William", LastName = "P.", FullName = "William P.", AvatarUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80", Bio = "Backend Developer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "sophia_m", Email = "sophia@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Sophia", LastName = "M.", FullName = "Sophia M.", AvatarUrl = "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&q=80", Bio = "Frontend Developer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "lucas_g", Email = "lucas@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Lucas", LastName = "G.", FullName = "Lucas G.", AvatarUrl = "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&q=80", Bio = "Fullstack Developer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "isabella_c", Email = "isabella@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Isabella", LastName = "C.", FullName = "Isabella C.", AvatarUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80", Bio = "QA Engineer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "ethan_r", Email = "ethan@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Ethan", LastName = "R.", FullName = "Ethan R.", AvatarUrl = "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&q=80", Bio = "System Administrator", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "mia_l", Email = "mia@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Mia", LastName = "L.", FullName = "Mia L.", AvatarUrl = "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=150&q=80", Bio = "Project Manager", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "alexander_s", Email = "alexander@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Alexander", LastName = "S.", FullName = "Alexander S.", AvatarUrl = "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&q=80", Bio = "Tech Lead", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "charlotte_f", Email = "charlotte@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Charlotte", LastName = "F.", FullName = "Charlotte F.", AvatarUrl = "https://images.unsplash.com/photo-1513956589380-bad6f19e55ce?w=150&q=80", Bio = "UI/UX Designer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true },
                        new User { Username = "daniel_v", Email = "daniel@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"), FirstName = "Daniel", LastName = "V.", FullName = "Daniel V.", AvatarUrl = "https://images.unsplash.com/photo-1504257432389-523431e11b7e?w=150&q=80", Bio = "Mobile Developer", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow, IsActive = true }
                    };
                    await context.Users.AddRangeAsync(extraUsers);
                    await context.SaveChangesAsync();
                }
                return;
            }

            logger.LogInformation("Seeding database...");

            var users = new List<User>
            {
                new User
                {
                    Username = "alex_m",
                    Email = "alex@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(" !"),
                    FirstName = "Alex",
                    LastName = "M.",
                    FullName = "Alex M.",
                    AvatarUrl = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80",
                    CoverUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
                    Bio = "Digital artist & developer",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new User
                {
                    Username = "elena_r",
                    Email = "elena@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    FirstName = "Elena",
                    LastName = "R.",
                    FullName = "Elena R.",
                    AvatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
                    Bio = "Music producer and sound designer",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new User
                {
                    Username = "maya_s",
                    Email = "maya@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                    FirstName = "Maya",
                    LastName = "S.",
                    FullName = "Maya S.",
                    AvatarUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
                    Bio = "UX Designer",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();

            var alex = users[0];
            var elena = users[1];
            var maya = users[2];

            var posts = new List<Post>
            {
                new Post
                {
                    UserId = alex.Id,
                    Content = "Exploring the new digital frontiers. The aesthetics of dark mode architecture combined with neo-brutalism elements is fascinating. Thoughts? 🚀 #design #future",
                    Visibility = SocialNetwork.Domain.Enums.VisibilityType.Public,
                    LikeCount = 1200,
                    CommentCount = 2,
                    CreatedAt = DateTime.UtcNow.AddHours(-2),
                    UpdatedAt = DateTime.UtcNow.AddHours(-2),
                    Media = new List<PostMedia>
                    {
                        new PostMedia
                        {
                            MediaUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
                            MediaType = SocialNetwork.Domain.Enums.MediaType.Image,
                            CreatedAt = DateTime.UtcNow.AddHours(-2)
                        }
                    }
                },
                new Post
                {
                    UserId = elena.Id,
                    Content = "Just wrapped up the latest ambient soundscapes track. Minimalist beats for deep focus. 🎧✨",
                    Visibility = SocialNetwork.Domain.Enums.VisibilityType.Public,
                    LikeCount = 8492,
                    CommentCount = 1,
                    CreatedAt = DateTime.UtcNow.AddHours(-5),
                    UpdatedAt = DateTime.UtcNow.AddHours(-5)
                }
            };

            await context.Posts.AddRangeAsync(posts);
            await context.SaveChangesAsync();

            var comments = new List<Comment>
            {
                new Comment
                {
                    PostId = posts[0].Id,
                    UserId = elena.Id,
                    Content = "Absolutely love this aesthetic! The colors are so vibrant yet calming.",
                    CreatedAt = DateTime.UtcNow.AddHours(-1),
                    UpdatedAt = DateTime.UtcNow.AddHours(-1)
                },
                new Comment
                {
                    PostId = posts[0].Id,
                    UserId = maya.Id,
                    Content = "Neo-brutalism is definitely making a huge comeback.",
                    CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                    UpdatedAt = DateTime.UtcNow.AddMinutes(-30)
                },
                new Comment
                {
                    PostId = posts[1].Id,
                    UserId = alex.Id,
                    Content = "Can't wait to listen to this while coding today!",
                    CreatedAt = DateTime.UtcNow.AddHours(-4),
                    UpdatedAt = DateTime.UtcNow.AddHours(-4)
                }
            };

            await context.Comments.AddRangeAsync(comments);
            await context.SaveChangesAsync();
            
            var likes = new List<Like>
            {
                new Like { UserId = elena.Id, PostId = posts[0].Id, CreatedAt = DateTime.UtcNow },
                new Like { UserId = maya.Id, PostId = posts[0].Id, CreatedAt = DateTime.UtcNow },
                new Like { UserId = alex.Id, PostId = posts[1].Id, CreatedAt = DateTime.UtcNow },
                new Like { UserId = maya.Id, PostId = posts[1].Id, CreatedAt = DateTime.UtcNow }
            };

            await context.Likes.AddRangeAsync(likes);
            await context.SaveChangesAsync();

            logger.LogInformation("Database seeding completed.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
        }
    }
}
