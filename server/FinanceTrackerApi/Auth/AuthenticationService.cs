using System.Security.Cryptography;
using System.Text;
using FinanceTrackerApi.DAL;
using Npgsql;

namespace FinanceTrackerApi.Auth;

// ReSharper disable once UnusedType.Global
public class AuthenticationService
{
    private Database Database { get; }

    public AuthenticationService(Database database)
    {
        this.Database = database;
    }

    public async Task<UserPoco> GetUserById(int userId)
    {
        var userPoco = await this.Database.QueryOne<UserPoco>("SELECT * FROM user_accounts WHERE user_id=@userId;",
            new NpgsqlParameter("userId", userId));

        return userPoco;
    }

    public async Task Register(UserCredentialsDTO dto)
    {
        byte[] passwordBytes = Encoding.ASCII.GetBytes(dto.Password!);

        byte[] result;

        using (var shaM = SHA512.Create())
        {
            result = shaM.ComputeHash(passwordBytes);
        }

        var poco = new UserPoco
        {
            Password = result,
            Username = dto.Username!
        };

        await this.Database.Insert(poco);
    }

    public async Task<string?> Login(UserCredentialsDTO dto)
    {
        byte[] passwordBytes = Encoding.ASCII.GetBytes(dto.Password!);

        byte[] hashedPassword;

        using (var shaM = SHA512.Create())
        {
            hashedPassword = shaM.ComputeHash(passwordBytes);
        }


        var userPoco = await this.Database.QueryOne<UserPoco>(
            "SELECT * FROM user_accounts u WHERE u.username=@username AND u.password=@password;",
            new NpgsqlParameter("username", dto.Username!), new NpgsqlParameter("password", hashedPassword));

        if (userPoco == null)
        {
            return null;
        }

        var now = DateTime.UtcNow;

        var sessionPoco = new SessionPoco
        {
            LoggedOut = false,
            ExpirationDate = now.AddDays(1),
            LoginTime = now,
            UserId = userPoco.UserId,
            SessionKey = GetRandomSessionKey()
        };

        await this.Database.Insert(sessionPoco);

        return sessionPoco.SessionKey;
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

    public async Task<bool> IsUsernameFree(string username)
    {
        var userPoco = await this.Database.QueryOne<UserPoco>(
            "SELECT * FROM user_accounts u WHERE u.username=@username;",
            new NpgsqlParameter("username", username));

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
