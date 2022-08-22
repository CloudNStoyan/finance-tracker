
namespace FinanceTrackerApi.Transaction;

public class TransactionEventDTO
{
    public string Event { get; set; }
    public TransactionDTO Transaction { get; set; }
}
