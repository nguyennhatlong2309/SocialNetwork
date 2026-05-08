namespace SocialNetwork.Application.DTOs.User;

public class UserDto
{
    public long Id { get; set; }
    public string Username { get; set; } = null!;
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsVerified { get; set; }
}

public class UserProfileDto
{
    public long Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public string? Bio { get; set; }
    public string? Gender { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
    public bool IsPrivate { get; set; }
    public DateTime CreatedAt { get; set; }
}
