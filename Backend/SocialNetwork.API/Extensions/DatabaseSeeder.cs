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
                logger.LogInformation("Database already seeded.");
                return;
            }

            logger.LogInformation("Seeding database...");

            var users = new List<User>
            {
                new User
                {
                    Username = "alex_m",
                    Email = "alex@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
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
