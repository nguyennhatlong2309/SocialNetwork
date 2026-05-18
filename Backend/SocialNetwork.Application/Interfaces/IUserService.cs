using SocialNetwork.Application.DTOs.User;

namespace SocialNetwork.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(long currentUserId, long profileUserId);
    Task<bool> ToggleFollowAsync(long followerId, long followingId);
    Task<IEnumerable<UserDto>> GetSuggestedUsersAsync(long currentUserId, int count = 10);
    Task<IEnumerable<UserDto>> SearchUsersAsync(string query, int count = 10);
    Task<IEnumerable<AdminUserDto>> GetAllAdminUsersAsync();
    Task<bool> BanUserAsync(long userId);
    Task<bool> UnbanUserAsync(long userId);
    Task<bool> PromoteToAdminAsync(long userId);
}
