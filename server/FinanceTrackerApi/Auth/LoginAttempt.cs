namespace FinanceTrackerApi.Auth;

public class LoginAttempt
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string? SessionKey { get; set; }  
}
