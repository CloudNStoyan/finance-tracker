
namespace FinanceTrackerApi.Transaction;

public class TransactionEventDTO
{
    public string Event { get; set; }
    public UserTransactionDTO Transaction { get; set; }
}
