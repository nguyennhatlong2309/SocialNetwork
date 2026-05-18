using System.ComponentModel.DataAnnotations;

namespace SocialNetwork.Application.DTOs.Auth;

public class RegisterDto
{
    [Required, StringLength(50, MinimumLength = 3)]
    public string Username { get; set; } = null!;

    [Required, EmailAddress, StringLength(150)]
    public string Email { get; set; } = null!;

    [Required, StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = null!;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(200)]
    public string? FullName { get; set; }
}

public class LoginDto
{
    [Required]
    public string UsernameOrEmail { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;
}

public class RefreshTokenDto
{
    [Required]
    public string RefreshToken { get; set; } = null!;
}

public class AuthResponseDto
{
    public long UserId { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = "Member";
    public string AccessToken { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}
