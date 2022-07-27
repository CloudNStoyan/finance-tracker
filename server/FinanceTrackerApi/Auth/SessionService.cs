namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class SessionService
{
    private IHttpContextAccessor ContextAccessor { get; }

    public SessionService(IHttpContextAccessor contextAccessor)
    {
        this.ContextAccessor = contextAccessor;
    }

    public RequestSession Session => this.ContextAccessor.HttpContext.GetSession();
}

public static class ExtensionSession
{
    private const string SessionKey = "__session__";

    public static RequestSession GetSession(this HttpContext context)
    {
        return (RequestSession)context.Items[SessionKey];
    }

    public static void SetSession(this HttpContext context, RequestSession session)
    {
        context.Items[SessionKey] = session;
    }
}