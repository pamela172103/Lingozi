using Lingozi.Accounts.Authentication;

namespace Lingozi.Api.IntegrationTests;

/// <summary>TC-AUTH-002 (unit part): email validation and normalization.</summary>
public sealed class EmailAddressNormalizerTests
{
    [Theory]
    [InlineData("an@example.com", "an@example.com")]
    [InlineData("  An.Nguyen+tag@Example.COM  ", "an.nguyen+tag@example.com")]
    [InlineData("a@b.vn", "a@b.vn")]
    public void AcceptsValidAddresses(string input, string expected)
    {
        Assert.True(EmailAddressNormalizer.TryNormalize(input, out var normalized));
        Assert.Equal(expected, normalized);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("an@")]
    [InlineData("@example.com")]
    [InlineData("an")]
    [InlineData("an@example")]
    [InlineData("an@@example.com")]
    [InlineData("a b@example.com")]
    [InlineData("an@exa mple.com")]
    [InlineData("an@.example.com")]
    [InlineData("an@example..com")]
    [InlineData("An <an@example.com>")]
    [InlineData("an@exam\nple.com")]
    public void RejectsInvalidAddresses(string? input)
    {
        Assert.False(EmailAddressNormalizer.TryNormalize(input, out var normalized));
        Assert.Equal(string.Empty, normalized);
    }

    [Fact]
    public void RejectsMoreThan256Characters()
    {
        var tooLong = new string('a', 60) + "@" + new string('b', 190) + ".com"; // 60 + 1 + 190 + 4 = 255 -> valid
        Assert.True(EmailAddressNormalizer.TryNormalize(tooLong, out _));
        Assert.False(EmailAddressNormalizer.TryNormalize(tooLong + "xx", out _));
    }
}
