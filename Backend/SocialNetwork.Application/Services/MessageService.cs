using AutoMapper;
using SocialNetwork.Application.DTOs.Message;
using SocialNetwork.Application.Interfaces;
using SocialNetwork.Domain.Entities;
using SocialNetwork.Domain.Enums;

namespace SocialNetwork.Application.Services;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;
    private readonly IRepository<ConversationMember> _memberRepository;
    private readonly IRealtimeChatService _realtimeChatService;
    private readonly IMapper _mapper;

    public MessageService(
        IMessageRepository messageRepository,
        IRepository<ConversationMember> memberRepository,
        IRealtimeChatService realtimeChatService,
        IMapper mapper)
    {
        _messageRepository = messageRepository;
        _memberRepository = memberRepository;
        _realtimeChatService = realtimeChatService;
        _mapper = mapper;
    }

    public async Task<MessageDto> SendMessageAsync(long senderId, SendMessageDto dto)
    {
        // Verify user is a member of the conversation
        var members = await _memberRepository
            .FindAsync(cm => cm.ConversationId == dto.ConversationId
                          && cm.UserId == senderId
                          && cm.LeftAt == null);

        if (!members.Any())
            throw new UnauthorizedAccessException("You are not a member of this conversation.");

        var message = new Message
        {
            ConversationId = dto.ConversationId,
            SenderId = senderId,
            Content = dto.Content,
            MessageType = Enum.Parse<MessageType>(dto.MessageType, ignoreCase: true),
            ReplyToMessageId = dto.ReplyToMessageId,
            SentAt = DateTime.UtcNow
        };

        await _messageRepository.AddAsync(message);

        // Reload with sender info
        var messages = await _messageRepository
            .GetConversationMessagesAsync(dto.ConversationId, 1, 1);
        var sent = messages.FirstOrDefault(m => m.Id == message.Id);
        var messageDto = _mapper.Map<MessageDto>(sent ?? message);

        // Push real-time tới tất cả members trong conversation
        await _realtimeChatService.PushNewMessageAsync(dto.ConversationId, messageDto);

        return messageDto;
    }

    public async Task<IEnumerable<MessageDto>> GetConversationMessagesAsync(
        long userId, long conversationId, int page, int pageSize)
    {
        // Verify membership
        var members = await _memberRepository
            .FindAsync(cm => cm.ConversationId == conversationId
                          && cm.UserId == userId
                          && cm.LeftAt == null);

        if (!members.Any())
            throw new UnauthorizedAccessException("You are not a member of this conversation.");

        var messages = await _messageRepository
            .GetConversationMessagesAsync(conversationId, page, pageSize);

        return _mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(long userId)
    {
        var conversations = await _messageRepository.GetUserConversationsAsync(userId);
        return _mapper.Map<IEnumerable<ConversationDto>>(conversations);
    }
}
