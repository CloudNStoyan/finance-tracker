using System.ComponentModel.DataAnnotations;
using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Transaction;

public class UserTransactionDTO
{
    public int? TransactionId { get; set; }

    [Required]
    public string? Label { get; set; }

    [Required]
    public string? Type { get; set; }

    [Required]
    [Range(0, int.MaxValue)]
    public decimal Value { get; set; }

    public int? CategoryId { get; set; }

    [Required]
    public DateTime TransactionDate { get; set; }

    public DateTime? RepeatEndDate { get; set; }
    public int? RepeatEndOccurrences { get; set; }
    public string? RepeatEndType { get; set; }
    public int? RepeatEvery { get; set; }
    public int? UserId { get; set; }

    [Required]
    public bool Confirmed { get; set; }

    public string? Details { get; set; }
    public string? Repeat { get; set; }

    public static UserTransactionDTO FromPoco(UserTransactionPoco poco) => new()
    {
        TransactionId = poco.UserTransactionId,
        CategoryId = poco.CategoryId,
        Confirmed = poco.Confirmed,
        Details = poco.Details,
        Value = poco.Value,
        Label = poco.Label,
        Type = poco.Type,
        TransactionDate = poco.TransactionDate,
        UserId = poco.UserId,
        Repeat = poco.Repeat,
        RepeatEndDate = poco.RepeatEndDate,
        RepeatEndOccurrences = poco.RepeatEndOccurrences,
        RepeatEndType = poco.RepeatEndType,
        RepeatEvery = poco.RepeatEvery
    };
}
