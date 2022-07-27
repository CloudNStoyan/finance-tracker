namespace FinanceTrackerApi.Auth;

public class AuthMiddleware
{
    private readonly RequestDelegate next;

    public AuthMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    // ReSharper disable once UnusedMember.Global
    public async Task Invoke(HttpContext context, AuthenticationService authService,
        SessionCookieService sessionCookieService)
    {
        context.SetSession(new RequestSession());

        string sessionKey = sessionCookieService.GetSessionKey();

        if (string.IsNullOrWhiteSpace(sessionKey))
        {
            await this.next.Invoke(context);
            return;
        }

        var session = await authService.GetSessionBySessionKey(sessionKey);

        var now = DateTime.UtcNow;

        if (session == null || session.LoggedOut || session.ExpirationDate <= now)
        {
            await this.next.Invoke(context);
            return;
        }

        context.SetSession(new RequestSession
        {
            IsLoggedIn = true,
            SessionId = session.SessionId,
            UserId = session.UserId
        });

        await this.next.Invoke(context);
    }
}

/// <summary>
/// This contains the session that the current user is connected with.
/// </summary>
public class RequestSession
{
    public bool IsLoggedIn { get; set; }

    public int? UserId { get; set; }

    public int SessionId { get; set; }
}

public class AccountModel
{
    public string Username { get; set; }

    public int UserId { get; set; }

    public string Avatar { get; set; }
}

/// <summary>
/// Connects the AuthMiddleware to the pipe.
/// </summary>
public static class MyMiddleWareExtensions
{
    public static IApplicationBuilder UseAuthMiddleware(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<AuthMiddleware>();
    }
}
