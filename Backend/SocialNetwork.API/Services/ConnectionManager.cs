using System.Collections.Concurrent;

namespace SocialNetwork.API.Services;

/// <summary>
/// Quản lý mapping UserId → Set&lt;ConnectionId&gt; (in-memory, singleton).
/// Hỗ trợ multi-tab: một user có thể có nhiều ConnectionId đồng thời.
/// </summary>
public interface IConnectionManager
{
    void Add(long userId, string connectionId);
    void Remove(long userId, string connectionId);
    IReadOnlySet<string> GetConnections(long userId);
    bool HasConnections(long userId);
}

public class ConnectionManager : IConnectionManager
{
    // userId → set of active connectionIds
    private readonly ConcurrentDictionary<long, HashSet<string>> _connections = new();
    private readonly object _lock = new();

    public void Add(long userId, string connectionId)
    {
        lock (_lock)
        {
            if (!_connections.TryGetValue(userId, out var connections))
            {
                connections = new HashSet<string>();
                _connections[userId] = connections;
            }
            connections.Add(connectionId);
        }
    }

    public void Remove(long userId, string connectionId)
    {
        lock (_lock)
        {
            if (_connections.TryGetValue(userId, out var connections))
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                    _connections.TryRemove(userId, out _);
            }
        }
    }

    public IReadOnlySet<string> GetConnections(long userId)
    {
        lock (_lock)
        {
            return _connections.TryGetValue(userId, out var connections)
                ? connections
                : (IReadOnlySet<string>)new HashSet<string>();
        }
    }

    public bool HasConnections(long userId)
    {
        return _connections.TryGetValue(userId, out var connections)
               && connections.Count > 0;
    }
}
