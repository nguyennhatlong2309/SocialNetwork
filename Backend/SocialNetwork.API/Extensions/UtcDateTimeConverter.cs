using System.Text.Json;
using System.Text.Json.Serialization;

namespace SocialNetwork.API.Extensions;

/// <summary>
/// Custom JSON converter cho DateTime.
/// 
/// Vấn đề: EF Core đọc DateTime từ MySQL trả về Kind = Unspecified.
/// System.Text.Json chỉ thêm 'Z' nếu Kind = Utc.
/// Kết quả: frontend nhận "2026-05-15T13:54:27" (không có Z)
///          → JavaScript hiểu là local time → lệch múi giờ.
///
/// Fix: Converter này luôn assume DateTime là UTC khi serialize,
///      đảm bảo output có dạng "2026-05-15T13:54:27Z".
/// </summary>
public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Khi deserialize, luôn trả về DateTime với Kind = Utc
        var value = reader.GetDateTime();
        return value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Khi serialize, luôn convert sang UTC trước khi write
        // → System.Text.Json sẽ tự thêm 'Z' suffix khi Kind = Utc
        var utcValue = value.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
            : value.ToUniversalTime();

        writer.WriteStringValue(utcValue);
    }
}
