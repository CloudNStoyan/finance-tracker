using System.ComponentModel.DataAnnotations;
using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Transaction;

public class TransactionDTO
{
    public int? TransactionId { get; set; }

    [Required]
    public string? Label { get; set; }

    [Required]
    public string? Type { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public decimal Value { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public int? Category { get; set; }

    [Required]
    public DateTime TransactionDate { get; set; }

    public int? UserId { get; set; }

    [Required]
    public bool Confirmed { get; set; }

    public int? ImageReceiptId { get; set; }

    public string? Details { get; set; }

    public static TransactionDTO FromPoco(TransactionPoco poco) => new()
    {
        TransactionId = poco.TransactionId,
        Category = poco.CategoryId,
        Confirmed = poco.Confirmed,
        Details = poco.Details,
        ImageReceiptId = poco.ImageReceiptId,
        Value = poco.Value,
        Label = poco.Label,
        Type = poco.Type,
        TransactionDate = poco.TransactionDate,
        UserId = poco.UserId,
    };
}
