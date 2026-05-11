using SocialNetwork.Application.DTOs.Message;

namespace SocialNetwork.Application.Interfaces;

/// <summary>
/// Interface để push tin nhắn mới real-time tới các thành viên trong conversation.
/// </summary>
public interface IRealtimeChatService
{
    /// <summary>
    /// Đẩy tin nhắn mới tới tất cả members trong conversation.
    /// </summary>
    Task PushNewMessageAsync(long conversationId, MessageDto message);
}
