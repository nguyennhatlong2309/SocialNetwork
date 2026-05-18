namespace SocialNetwork.Application.DTOs.User;

public class AdminUserDto
{
    public long Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = "Member";
    public string Status { get; set; } = "active";
    public string Joined { get; set; } = null!;
    public int Posts { get; set; }
    public int Followers { get; set; }
}
