using System.Security.Cryptography;
using System.Text;
using FinanceTrackerApi.DAL;
using Npgsql;

namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class AuthenticationService
{
    private Database Database { get; }
    private PasswordService PasswordService { get; }

    public AuthenticationService(Database database, PasswordService passwordService)
    {
        this.Database = database;
        this.PasswordService = passwordService;
    }

    public async Task<UserPoco?> GetUserById(int userId)
    {
        var userPoco = await this.Database.QueryOne<UserPoco>("SELECT * FROM user_accounts WHERE user_id=@userId;",
            new NpgsqlParameter("userId", userId));

        return userPoco;
    }

    public async Task<VerifyUserPoco?> GetVerifyUserByToken(string verifyToken)
    {
        var verifyUserPoco = await this.Database.QueryOne<VerifyUserPoco>("SELECT * FROM verify_users WHERE verify_token=@verifyToken;",
            new NpgsqlParameter("verifyToken", verifyToken));

        return verifyUserPoco;
    }

    public async Task ActivateAccount(int userId, string verifyToken)
    {
        var userPoco = await this.GetUserById(userId);

        if (userPoco == null)
        {
            return;
        }

        userPoco.Activated = true;

        await this.Database.Update(userPoco);

        var verifyUserPoco = await this.GetVerifyUserByToken(verifyToken);

        if (verifyUserPoco == null)
        {
            return;
        }

        verifyUserPoco.Consumed = true;

        await this.Database.Update(verifyUserPoco);
    }

    public async Task<string> CreateVerifyToken(int userId)
    {
        var now = DateTime.Now;

        string verifyToken = GenerateRandomUnsecureString(6);

        var verifyUserPoco = new VerifyUserPoco
        {
            ExpirationDate = now.AddDays(1),
            UserId = userId,
            VerifyToken = verifyToken,
            Consumed = false
        };

        await this.Database.Insert(verifyUserPoco);

        return verifyToken;
    }

    public async Task<string> Register(UserCredentialsDTO dto)
    {
        string passwordHash = this.PasswordService.HashPassword(dto.Password!);
        
        var userPoco = new UserPoco
        {
            PasswordHash = passwordHash,
            Email = dto.Email!.ToLower()
        };

        int? userId = await this.Database.Insert(userPoco);

        string verifyToken = await this.CreateVerifyToken(userId!.Value);

        return verifyToken;
    }

    public async Task<LoginAttempt> Login(UserCredentialsDTO dto)
    {
        var userPoco = await this.Database.QueryOne<UserPoco>(
            "SELECT * FROM user_accounts u WHERE u.email=@email",
            new NpgsqlParameter("email", dto.Email!));

        if (userPoco == null)
        {
            return new LoginAttempt
            {
                Success = false,
                Error = LoginError.AccountNotFound
            };  
        }

        bool passwordIsValid = this.PasswordService.VerifyPassword(dto.Password!, userPoco.PasswordHash);

        if (!passwordIsValid)
        {
            return new LoginAttempt
            {
                Success = false,
                Error = LoginError.AccountNotFound
            };
        }

        var now = DateTime.UtcNow;

        string sessionKey = GenerateRandomSecureString();

        var sessionPoco = new SessionPoco
        {
            LoggedOut = false,
            ExpirationDate = now.AddDays(1),
            LoginTime = now,
            UserId = userPoco.UserId,
            SessionKey = sessionKey
        };

        await this.Database.Insert(sessionPoco);

        return new LoginAttempt
        {
            Success = true,
            SessionKey = sessionKey,
            User = userPoco
        };
    }

    public async Task Logout(int sessionId)
    {
        var session = await this.Database.QueryOne<SessionPoco>(
            "SELECT * FROM sessions s WHERE s.session_id=@sessionId;", new NpgsqlParameter("sessionId", sessionId));

        if (session == null)
        {
            return;
        }

        var now = DateTime.UtcNow;

        session.LoggedOut = true;
        session.LogoutTime = now;
        
        await this.Database.Update(session);
    }

    public async Task<SessionPoco?> GetSessionBySessionKey(string sessionKey)
    {
        var sessionPoco = await this.Database.QueryOne<SessionPoco>(
            "SELECT * FROM sessions s WHERE s.session_key=@sessionKey;", new NpgsqlParameter("sessionKey", sessionKey));

        return sessionPoco;
    }

    public async Task<bool> IsEmailFree(string email)
    {
        var userPoco = await this.Database.QueryOne<UserPoco>(
            "SELECT * FROM user_accounts u WHERE u.email=lower(@email);",
            new NpgsqlParameter("email", email));

        return userPoco == null;
    }

    private static string GenerateRandomSecureString()
    {
        byte[] randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    private static string GenerateRandomUnsecureString(int length)
    {
        var builder = new StringBuilder();

        var random = new Random();

        const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (int i = 0; i < length; i++)
        {
            builder.Append(letters[random.Next(letters.Length)]);
        }

        return builder.ToString();
    }
}
