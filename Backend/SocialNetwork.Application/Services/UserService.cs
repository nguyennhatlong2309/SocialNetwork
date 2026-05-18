using SocialNetwork.Application.DTOs.User;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SocialNetwork.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IRepository<Follow> _followRepository;
    private readonly IPostRepository _postRepository;

    public UserService(
        IUserRepository userRepository,
        IRepository<Follow> followRepository,
        IPostRepository postRepository)
    {
        _userRepository = userRepository;
        _followRepository = followRepository;
        _postRepository = postRepository;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(long currentUserId, long profileUserId)
    {
        var user = await _userRepository.GetByIdAsync(profileUserId);
        if (user == null) return null;

        var followersCount = await _followRepository.Query().CountAsync(f => f.FollowingId == profileUserId);
        var followingCount = await _followRepository.Query().CountAsync(f => f.FollowerId == profileUserId);
        var postsCount = await _postRepository.Query().CountAsync(p => p.UserId == profileUserId && !p.IsDeleted);

        bool isFollowing = false;
        if (currentUserId != profileUserId)
        {
            isFollowing = await _followRepository.Query()
                .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == profileUserId);
        }

        return new UserProfileDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            CoverUrl = user.CoverUrl,
            Bio = user.Bio,
            Gender = user.Gender.ToString(),
            BirthDate = user.BirthDate,
            Phone = user.Phone,
            Website = user.Website,
            Location = user.Location,
            IsVerified = user.IsVerified,
            IsPrivate = user.IsPrivate,
            CreatedAt = user.CreatedAt,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            PostsCount = postsCount,
            IsFollowing = isFollowing
        };
    }

    public async Task<bool> ToggleFollowAsync(long followerId, long followingId)
    {
        if (followerId == followingId)
            throw new ArgumentException("You cannot follow yourself.");

        var userToFollow = await _userRepository.GetByIdAsync(followingId);
        if (userToFollow == null)
            throw new ArgumentException("User not found.");

        var existingFollow = await _followRepository.Query()
            .FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

        if (existingFollow != null)
            await _followRepository.DeleteAsync(existingFollow);
        else
            await _followRepository.AddAsync(new Follow { FollowerId = followerId, FollowingId = followingId });

        return existingFollow == null; // Returns true if followed, false if unfollowed
    }

    public async Task<IEnumerable<UserDto>> GetSuggestedUsersAsync(long currentUserId, int count = 10)
    {
        // Lấy danh sách ID những người mà currentUser đã follow
        var followingIds = await _followRepository.Query()
            .Where(f => f.FollowerId == currentUserId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        // Lấy tất cả users, trừ chính mình và những người đã follow
        var suggestedUsers = await _userRepository.Query()
            .Where(u => u.Id != currentUserId && !followingIds.Contains(u.Id))
            .OrderBy(u => EF.Functions.Random()) // Random order
            .Take(count)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                AvatarUrl = u.AvatarUrl,
                IsVerified = u.IsVerified,
            })
            .ToListAsync();

        return suggestedUsers;
    }

    public async Task<IEnumerable<UserDto>> SearchUsersAsync(string query, int count = 10)
    {
        var users = await _userRepository.SearchUsersAsync(query, count);
        return users.Select(u => new UserDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            AvatarUrl = u.AvatarUrl,
            IsVerified = u.IsVerified
        });
    }
    public async Task<IEnumerable<AdminUserDto>> GetAllAdminUsersAsync()
    {
        var users = await _userRepository.Query()
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                u.IsBanned,
                u.Role,
                u.CreatedAt,
                Posts = u.Posts.Count,
                Followers = u.Followers.Count
            })
            .ToListAsync();

        return users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Username = u.Username,
            Email = u.Email,
            Role = u.Role.ToString(),
            Status = u.IsBanned ? "banned" : "active",
            Joined = u.CreatedAt.ToString("yyyy-MM-dd"),
            Posts = u.Posts,
            Followers = u.Followers
        });
    }

    public async Task<bool> BanUserAsync(long userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;
        
        user.IsBanned = true;
        user.IsActive = false;
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> UnbanUserAsync(long userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;
        
        user.IsBanned = false;
        user.IsActive = true;
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> PromoteToAdminAsync(long userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;
        
        user.Role = SocialNetwork.Domain.Enums.UserRole.Admin;
        await _userRepository.UpdateAsync(user);
        
        return true;
    }
}
