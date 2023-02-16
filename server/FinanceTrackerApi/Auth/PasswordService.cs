namespace FinanceTrackerApi.Auth;
using BC = BCrypt.Net.BCrypt;

public class PasswordService
{
    public string HashPassword(string password) => BC.HashPassword(password);
    public bool VerifyPassword(string password, string passwordHash) => BC.Verify(password, passwordHash);
}
