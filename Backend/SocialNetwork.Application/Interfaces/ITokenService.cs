using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
