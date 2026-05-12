using SocialNetwork.Application.DTOs.User;

namespace SocialNetwork.Application.DTOs.Post;

public class PostDto
{
    public long Id { get; set; }
    public string? Content { get; set; }
    public string Visibility { get; set; } = null!;
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ShareCount { get; set; }
    public bool IsEdited { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsLiked { get; set; }

    public UserDto User { get; set; } = null!;
    public List<PostMediaDto> Media { get; set; } = new();
}

public class PostMediaDto
{
    public long Id { get; set; }
    public string MediaUrl { get; set; } = null!;
    public string MediaType { get; set; } = null!;
}

public class CreatePostDto
{
    public string? Content { get; set; }
    public string Visibility { get; set; } = "public";
}

public class CommentDto
{
    public long Id { get; set; }
    public string Content { get; set; } = null!;
    public int LikeCount { get; set; }
    public bool IsEdited { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDto User { get; set; } = null!;
    public long? ParentCommentId { get; set; }
}

public class PostDetailDto : PostDto
{
    public List<CommentDto> Comments { get; set; } = new();
}
