using System.Security.Cryptography;
using System.Text;
using FinanceTrackerApi.DAL;
using Npgsql;

namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class AuthenticationService
{
    private Database Database { get; }

    public AuthenticationService(Database database)
    {
        this.Database = database;
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

    public async Task ActivateAccount(int userId)
    {
        var userPoco = await this.GetUserById(userId);

        if (userPoco == null)
        {
            return;
        }

        userPoco.Activated = true;

        await this.Database.Update(userPoco);
    }

    public async Task<string> Register(UserCredentialsDTO dto)
    {
        byte[] passwordBytes = Encoding.ASCII.GetBytes(dto.Password!);

        byte[] result;

        using (var shaM = SHA512.Create())
        {
            result = shaM.ComputeHash(passwordBytes);
        }

        var userPoco = new UserPoco
        {
            Password = result,
            Email = dto.Email!.ToLower()
        };

        int? userId = await this.Database.Insert(userPoco);

        var now = DateTime.Now;

        string verifyToken = Guid.NewGuid().ToString();

        var verifyUserPoco = new VerifyUserPoco
        {
            ExpirationDate = now.AddDays(1),
            UserId = userId!.Value,
            VerifyToken = verifyToken,
            Consumed = false
        };

        await this.Database.Insert(verifyUserPoco);

        return verifyToken;
    }

    public async Task<LoginAttempt> Login(UserCredentialsDTO dto)
    {
        byte[] passwordBytes = Encoding.ASCII.GetBytes(dto.Password!);

        byte[] hashedPassword;

        using (var shaM = SHA512.Create())
        {
            hashedPassword = shaM.ComputeHash(passwordBytes);
        }

        var userPoco = await this.Database.QueryOne<UserPoco>(
            "SELECT * FROM user_accounts u WHERE u.email=@email AND u.password=@password;",
            new NpgsqlParameter("email", dto.Email!), new NpgsqlParameter("password", hashedPassword));

        if (userPoco == null)
        {
            return new LoginAttempt
            {
                Success = false,
                Error = "Your email and password do not match. Please try again."
            };
        }

        if (!userPoco.Activated)
        {
            return new LoginAttempt
            {
                Success = false,
                Error = "You have not activated your account yet. Please, check your inbox and confirm your account."
            };
        }

        var now = DateTime.UtcNow;

        string sessionKey = GetRandomSessionKey();

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
            SessionKey = sessionKey
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
    
    private static string GetRandomSessionKey()
    {
        var builder = new StringBuilder();

        var random = new Random();

        const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        const int length = 40;

        for (int i = 0; i < length; i++)
        {
            builder.Append(letters[random.Next(length)]);
        }

        return builder.ToString();
    }
}
