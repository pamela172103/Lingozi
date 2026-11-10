using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;

namespace Lingozi.Accounts.Email;

/// <summary>
/// Protects the outbox payload. The email needs the raw code until it is sent, so the payload is encrypted with the
/// persistent Data Protection key ring (ADR 0006) and cleared after sending; it is never logged (BR-AUTH-001).
/// </summary>
public sealed class EmailOutboxPayload(IDataProtectionProvider provider)
{
    private const string Purpose = "Lingozi.Accounts.EmailOutbox.v1";
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private readonly IDataProtector _protector = provider.CreateProtector(Purpose);

    public string SealedEmpty { get; } = JsonSerializer.Serialize(new Envelope(1, null), Json);

    public string Seal<T>(T content) =>
        JsonSerializer.Serialize(new Envelope(1, _protector.Protect(JsonSerializer.Serialize(content, Json))), Json);

    public T? Open<T>(string payloadJson)
    {
        var envelope = JsonSerializer.Deserialize<Envelope>(payloadJson, Json);
        return envelope?.Data is null ? default : JsonSerializer.Deserialize<T>(_protector.Unprotect(envelope.Data), Json);
    }

    private sealed record Envelope(int V, string? Data);
}

/// <summary>Content of a <see cref="EmailOutboxType.LoginCode"/> message.</summary>
public sealed record LoginCodePayload(string Code, int ValidMinutes);
