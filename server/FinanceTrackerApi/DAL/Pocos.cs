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