using AutoMapper;
using SocialNetwork.Application.DTOs.Message;
using SocialNetwork.Application.DTOs.Post;
using SocialNetwork.Application.DTOs.User;
using SocialNetwork.Domain.Entities;

namespace SocialNetwork.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ===== User =====
        CreateMap<User, UserDto>();
        CreateMap<User, UserProfileDto>()
            .ForMember(dest => dest.Gender,
                opt => opt.MapFrom(src => src.Gender.ToString().ToLower()));

        // ===== Post =====
        CreateMap<Post, PostDto>()
            .ForMember(dest => dest.Visibility,
                opt => opt.MapFrom(src => src.Visibility.ToString().ToLower()));

        CreateMap<Post, PostDetailDto>()
            .ForMember(dest => dest.Visibility,
                opt => opt.MapFrom(src => src.Visibility.ToString().ToLower()));

        CreateMap<PostMedia, PostMediaDto>()
            .ForMember(dest => dest.MediaType,
                opt => opt.MapFrom(src => src.MediaType.ToString().ToLower()));

        CreateMap<Comment, CommentDto>();

        // ===== Message =====
        CreateMap<Message, MessageDto>()
            .ForMember(dest => dest.MessageType,
                opt => opt.MapFrom(src => src.MessageType.ToString().ToLower()));

        CreateMap<MessageAttachment, MessageAttachmentDto>();

        // ===== Conversation =====
        CreateMap<Conversation, ConversationDto>()
            .ForMember(dest => dest.Type,
                opt => opt.MapFrom(src => src.Type.ToString().ToLower()));

        CreateMap<ConversationMember, ConversationMemberDto>()
            .ForMember(dest => dest.Username,
                opt => opt.MapFrom(src => src.User.Username))
            .ForMember(dest => dest.FullName,
                opt => opt.MapFrom(src => src.User.FullName))
            .ForMember(dest => dest.AvatarUrl,
                opt => opt.MapFrom(src => src.User.AvatarUrl))
            .ForMember(dest => dest.Role,
                opt => opt.MapFrom(src => src.Role.ToString().ToLower()));
    }
}
