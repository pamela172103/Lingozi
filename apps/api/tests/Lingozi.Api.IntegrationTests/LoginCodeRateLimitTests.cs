using Lingozi.Accounts.Authentication;

namespace Lingozi.Api.IntegrationTests;

/// <summary>BR-AUTH-009: 1 code per 60 seconds and 5 per hour per email (pure calculation).</summary>
public sealed class LoginCodeRateLimitTests
{
    private static readonly DateTime Now = new(2026, 11, 10, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void NoPreviousCodeMeansNoWait() =>
        Assert.Equal(0, LoginCodeRequestService.RetryAfterSeconds([], Now));

    [Fact]
    public void WaitsUntilSixtySecondsHavePassed() =>
        Assert.Equal(30, LoginCodeRequestService.RetryAfterSeconds([Now.AddSeconds(-30)], Now));

    [Fact]
    public void AllowsAnotherCodeAfterSixtySeconds() =>
        Assert.Equal(0, LoginCodeRequestService.RetryAfterSeconds([Now.AddSeconds(-61)], Now));

    [Fact]
    public void SixthCodeInAnHourWaitsUntilTheOldestLeavesTheWindow()
    {
        DateTime[] sent = [Now.AddMinutes(-2), Now.AddMinutes(-10), Now.AddMinutes(-20), Now.AddMinutes(-30), Now.AddMinutes(-40)];

        Assert.Equal(20 * 60, LoginCodeRequestService.RetryAfterSeconds(sent, Now));
    }

    [Fact]
    public void FourCodesInAnHourStillAllowAFifth()
    {
        DateTime[] sent = [Now.AddMinutes(-2), Now.AddMinutes(-10), Now.AddMinutes(-20), Now.AddMinutes(-30)];

        Assert.Equal(0, LoginCodeRequestService.RetryAfterSeconds(sent, Now));
    }
}
