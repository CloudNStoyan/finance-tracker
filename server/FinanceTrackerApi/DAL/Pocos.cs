namespace FinanceTrackerApi.DAL;

[Table(Name = "transaction", Schema = "public")]
public class TransactionPoco
{
    [Column(Name = "transaction_id", IsPrimaryKey = true)]
    public int TransactionId { get; set; }

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

    [Column(Name = "image_receipt_id")]
    public int? ImageReceiptId { get; set; }

    [Column(Name = "transaction_date")]
    public DateTime TransactionDate { get; set; }

    [Column(Name = "details")]
    public string? Details { get; set; }
}

[Table(Name = "category", Schema = "public")]
public class CategoryPoco
{
    [Column(Name = "category_id", IsPrimaryKey = true)]
    public int CategoryId { get; set; }

    [Column(Name = "name")]
    public string Name { get; set; }

    [Column(Name = "background_color")]
    public string BackgroundColor { get; set; }

    [Column(Name = "text_color")]
    public string TextColor { get; set; }

    [Column(Name = "list_order")]
    public int ListOrder { get; set; }

    [Column(Name = "icon")]
    public string Icon { get; set; }

    [Column(Name = "user_id")]
    public int? UserId { get; set; }
}