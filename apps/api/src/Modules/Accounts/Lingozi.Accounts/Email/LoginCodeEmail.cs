using System.Net;

namespace Lingozi.Accounts.Email;

/// <summary>Builds the sign-in code email (Vietnamese). Never includes anything besides the code and its validity.</summary>
public static class LoginCodeEmail
{
    public static EmailMessage Build(string to, LoginCodePayload payload)
    {
        ArgumentNullException.ThrowIfNull(payload);
        var text =
            $"Mã đăng nhập Lingozi của bạn là {payload.Code}.\n\n" +
            $"Mã có hiệu lực {payload.ValidMinutes} phút và chỉ dùng được một lần.\n" +
            "Nếu bạn không yêu cầu mã này, hãy bỏ qua thư này.";
        var html =
            "<p>Mã đăng nhập Lingozi của bạn là:</p>" +
            $"<p style=\"font-size:28px;font-weight:700;letter-spacing:6px\">{WebUtility.HtmlEncode(payload.Code)}</p>" +
            $"<p>Mã có hiệu lực {payload.ValidMinutes} phút và chỉ dùng được một lần.</p>" +
            "<p>Nếu bạn không yêu cầu mã này, hãy bỏ qua thư này.</p>";
        return new EmailMessage(to, "Mã đăng nhập Lingozi", text, html);
    }
}
