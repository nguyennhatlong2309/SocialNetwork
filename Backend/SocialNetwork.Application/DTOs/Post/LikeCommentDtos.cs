using System.ComponentModel.DataAnnotations;

namespace SocialNetwork.Application.DTOs.Post;

public class LikeResultDto
{
    public long PostId { get; set; }
    public bool IsLiked { get; set; }
    public int TotalLikes { get; set; }
}

public class CreateCommentDto
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Content { get; set; } = null!;

    public long? ParentCommentId { get; set; }
}
