namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class CookieService
{
    private IHttpContextAccessor ContextAccessor { get; }

    private HttpRequest Request => this.ContextAccessor.HttpContext.Request;

    public CookieService(IHttpContextAccessor contextAccessor)
    {
        this.ContextAccessor = contextAccessor;
    }

    public string GetCookie(string key)
    {
        return this.Request.Cookies[key];
    }
}

// ReSharper disable once ClassNeverInstantiated.Global
public class SessionCookieService
{
    private CookieService CookieService { get; }

    private const string CookieKey = "__session__";

    public SessionCookieService(CookieService cookieService)
    {
        this.CookieService = cookieService;
    }

    public string GetSessionKey()
    {
        return this.CookieService.GetCookie(CookieKey);
    }
}
