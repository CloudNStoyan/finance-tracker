using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Auth;

public class LoginAttempt
{
    public bool Success { get; set; }
    public LoginError? Error { get; set; }
    public string? SessionKey { get; set; }
    public UserPoco? User { get; set; }
}

public enum LoginError
{
    AccountNotFound,
}
