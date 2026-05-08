using Microsoft.Extensions.Configuration;
using SocialNetwork.Application.DTOs.Auth;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRepository<RefreshToken> _refreshTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IRepository<RefreshToken> refreshTokenRepository,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // Check if username or email already exists
        if (await _userRepository.ExistsByUsernameAsync(dto.Username))
            throw new InvalidOperationException("Username already exists.");

        if (await _userRepository.ExistsByEmailAsync(dto.Email))
            throw new InvalidOperationException("Email already exists.");

        // Create user
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            FullName = dto.FullName ?? $"{dto.FirstName} {dto.LastName}".Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        // Generate tokens
        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        // Find user by username or email
        var user = await _userRepository.GetByUsernameAsync(dto.UsernameOrEmail)
                   ?? await _userRepository.GetByEmailAsync(dto.UsernameOrEmail);

        if (user == null)
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive || user.IsBanned)
            throw new UnauthorizedAccessException("Account is deactivated or banned.");

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        // Update last seen
        user.LastSeenAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return await GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var tokens = await _refreshTokenRepository
            .FindAsync(rt => rt.Token == refreshToken && !rt.Revoked);

        var existingToken = tokens.FirstOrDefault();

        if (existingToken == null || existingToken.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        // Revoke old token
        existingToken.Revoked = true;
        await _refreshTokenRepository.UpdateAsync(existingToken);

        // Get user
        var user = await _userRepository.GetByIdAsync(existingToken.UserId)
            ?? throw new UnauthorizedAccessException("User not found.");

        return await GenerateAuthResponse(user);
    }

    private async Task<AuthResponseDto> GenerateAuthResponse(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpirationDays = int.Parse(
            _configuration["JwtSettings:RefreshTokenExpirationDays"] ?? "7");

        // Save refresh token
        var refreshTokenEntity = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow
        };
        await _refreshTokenRepository.AddAsync(refreshTokenEntity);

        var accessTokenExpirationMinutes = int.Parse(
            _configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "60");

        return new AuthResponseDto
        {
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(accessTokenExpirationMinutes)
        };
    }
}
