namespace FinanceTrackerApi.DAL;

[Table(Name = "user_transactions", Schema = "public")]
public class UserTransactionPoco
{
    [Column(Name = "user_transaction_id", IsPrimaryKey = true)]
    public int UserTransactionId { get; set; }

    [Column(Name = "user_id")]
    public int? UserId { get; set; }

    [Column(Name = "category_id")]
    public int? CategoryId { get; set; }

    [Column(Name = "value")]
    public decimal Value { get; set; }

    [Column(Name = "type")]
    public string Type { get; set; } = null!;

    [Column(Name = "label")]
    public string Label { get; set; }

    [Column(Name = "confirmed")]
    public bool Confirmed { get; set; }

    [Column(Name = "transaction_date")]
    public DateTime TransactionDate { get; set; }

    [Column(Name = "repeat_end")]
    public DateTime? RepeatEnd { get; set; }

    [Column(Name = "details")]
    public string? Details { get; set; }

    [Column(Name = "repeat")]
    public string? Repeat { get; set; }
}

[Table(Name = "categories", Schema = "public")]
public class CategoryPoco
{
    [Column(Name = "category_id", IsPrimaryKey = true)]
    public int CategoryId { get; set; }

    [Column(Name = "name")]
    public string Name { get; set; }

    [Column(Name = "background_color")]
    public string BackgroundColor { get; set; }

    [Column(Name = "list_order")]
    public int ListOrder { get; set; }

    [Column(Name = "icon")]
    public string Icon { get; set; }

    [Column(Name = "user_id")]
    public int? UserId { get; set; }
}

[Table(Name = "user_accounts", Schema = "public")]
public class UserPoco
{
    [Column(Name = "user_id", IsPrimaryKey = true)]
    public int UserId { get; set; }

    [Column(Name = "username")]
    public string Username { get; set; }

    [Column(Name = "password")]
    public byte[] Password { get; set; }
}

[Table(Name = "sessions", Schema = "public")]
public class SessionPoco
{
    [Column(Name = "session_id", IsPrimaryKey = true)]
    public int SessionId { get; set; }

    [Column(Name = "session_key")]
    public string SessionKey { get; set; }

    [Column(Name = "login_time")]
    public DateTime LoginTime { get; set; }

    [Column(Name = "user_id")]
    public int UserId { get; set; }

    [Column(Name = "logged_out")]
    public bool LoggedOut { get; set; }

    [Column(Name = "logout_time")]
    public DateTime? LogoutTime { get; set; }

    [Column(Name = "expiration_date")]
    public DateTime ExpirationDate { get; set; }
}