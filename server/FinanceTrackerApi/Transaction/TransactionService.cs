using FinanceTrackerApi.DAL;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;

namespace FinanceTrackerApi.Transaction;

// ReSharper disable once ClassNeverInstantiated.Global
public class TransactionService
{
    private Database Database { get; }

    public TransactionService(Database database)
    {
        this.Database = database;
    }

    public static UserTransactionPoco PocoFromDto(UserTransactionDTO dto)
    {
        var poco = new UserTransactionPoco
        {
            Label = dto.Label,
            Type = dto.Type,
            Confirmed = dto.Confirmed,
            Details = dto.Details,
            TransactionDate = dto.TransactionDate,
            Value = dto.Value,
            CategoryId = dto.CategoryId,
            UserId = dto.UserId,
            Repeat = dto.Repeat,
            RepeatEndDate = dto.RepeatEndDate,
            RepeatEndOccurrences = dto.RepeatEndOccurrences,
            RepeatEndType = dto.RepeatEndType,
            RepeatEvery = dto.RepeatEvery
        };

        if (dto.TransactionId.HasValue)
        {
            poco.UserTransactionId = dto.TransactionId.Value;
        }

        return poco;
    }

    public async Task<UserTransactionPoco?> GetById(int transactionId)
    {
        var poco = await this.Database.QueryOne<UserTransactionPoco>(
            "SELECT * FROM user_transactions t WHERE t.user_transaction_id=@transactionId;",
            new NpgsqlParameter("transactionId", transactionId));

        return poco;
    }

    public async Task<UserTransactionDTO[]> GetAllByDate(DateOnly date, int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            "SELECT * FROM user_transactions t WHERE t.transaction_date=@transactionDate AND t.user_id=@userId;",
            new NpgsqlParameter("transactionDate", date), new NpgsqlParameter("userId", userId));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO[]> GetAllByDateRange(DateOnly before, DateOnly after, int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            "SELECT * FROM user_transactions t WHERE t.user_id=@userId AND (t.transaction_date <= @before AND t.transaction_date >= @after OR t.repeat IS NOT NULL);",
            new NpgsqlParameter("before", before), new NpgsqlParameter("after", after), new NpgsqlParameter("userId", userId));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO[]> GetAllByMonth(int month, int year, int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            "SELECT * FROM user_transactions WHERE user_id=@userId AND ((EXTRACT(MONTH FROM transaction_date)=@month AND EXTRACT(YEAR FROM transaction_date)=@year) OR (repeat IS NOT NULL AND repeat != 'yearly' AND transaction_date < @beforeDate) OR (repeat = 'yearly' AND EXTRACT(MONTH FROM transaction_date)=@month));",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("month", month), new NpgsqlParameter("year", year), new NpgsqlParameter("beforeDate", new DateOnly(year, month, 1)));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO[]> GetTransactionsOnAndBeforeDate(DateOnly date, int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            "SELECT * FROM user_transactions WHERE user_id=@userId AND transaction_date <= @date;",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("date", date));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO[]> GetAllByUserId(int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            "SELECT * FROM user_transactions t WHERE t.user_id=@userId;", new NpgsqlParameter("userId", userId));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO[]> GetAllBySearchQuery(string searchQuery,int userId)
    {
        var pocos = await this.Database.Query<UserTransactionPoco>(
            @"SELECT * FROM user_transactions t LEFT JOIN categories c on t.category_id = c.category_id WHERE t.user_id=@userId AND (t.label ILIKE '%' || @searchQuery || '%' OR c.name ILIKE '%' || @searchQuery || '%' OR t.value::text ILIKE '%' || @searchQuery || '%');",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("searchQuery", searchQuery));

        return pocos.Select(UserTransactionDTO.FromPoco).ToArray();
    }

    public async Task<UserTransactionDTO> Create(UserTransactionDTO inputDto)
    {
        if (inputDto == null)
        {
            throw new ArgumentNullException(nameof(inputDto));
        }

        var poco = PocoFromDto(inputDto);

        int? transactionId = await this.Database.Insert(poco);

        var model = UserTransactionDTO.FromPoco(poco);

        model.TransactionId = transactionId;

        return model;
    }

    public async Task Update(UserTransactionPoco poco)
    {
        await this.Database.Update(poco);
    }
    
    public async Task Delete(UserTransactionPoco poco)
    {
        await this.Database.Delete(poco);
    }

    public async Task<TransactionEventDTO[]> UpdateRepeatInstance(UserTransactionDTO transaction)
    {
        var originalTransaction = await this.GetById(transaction.TransactionId!.Value);

        if (originalTransaction == null)
        {
            throw new Exception("UserTransaction ID was null");
        }

        var returnTransactionsList = new List<TransactionEventDTO>();

        if (originalTransaction!.TransactionDate == transaction.TransactionDate)
        {
            var originalRepeatEnd = originalTransaction!.RepeatEndDate;
            string? originalRepeat = originalTransaction.Repeat!;

            transaction.RepeatEndDate = null;
            transaction.Repeat = null;

            await this.Update(PocoFromDto(transaction));

            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = transaction });
            // updating the transaction original repeat end to null

            var newStartingDate = CalculateNextOccurrence(originalRepeat, transaction.TransactionDate);

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.TransactionDate = newStartingDate;

            if (newStartingDate == originalRepeatEnd)
            {
                newRepeatedTransaction.Repeat = null;
                newRepeatedTransaction.RepeatEndDate = null;
            }

            int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
            // creating the rest of the series
        }
        else
        {
            var originalRepeatEnd = originalTransaction!.RepeatEndDate;
            string? originalRepeat = originalTransaction.Repeat!;

            originalTransaction.RepeatEndDate = CalculatePreviousOccurrence(originalRepeat, transaction.TransactionDate);

            if (originalTransaction.RepeatEndDate <= originalTransaction.TransactionDate)
            {
                originalTransaction.Repeat = null;
                originalTransaction.RepeatEndDate = null;
            }

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) });
            // updating the transaction original repeat end to before this day

            transaction.Repeat = null;
            transaction.RepeatEndDate = null;

            int? transactionId = await this.Database.Insert(PocoFromDto(transaction));
            transaction.TransactionId = transactionId;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = transaction });
            // creating the new transaction for this day only

            var newStartingDate = CalculateNextOccurrence(originalRepeat, transaction.TransactionDate);

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEndDate = originalRepeatEnd;
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            if (newStartingDate == originalRepeatEnd)
            {
                newRepeatedTransaction.Repeat = null;
                newRepeatedTransaction.RepeatEndDate = null;
            }

            int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;

            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
            // creating the rest of the series
        }

        return returnTransactionsList.ToArray();
    }

    public async Task<TransactionEventDTO[]> UpdateRepeatInstanceAndForward(UserTransactionDTO transaction)
    {
        var originalTransaction = await this.GetById(transaction.TransactionId!.Value);

        if (originalTransaction == null)
        {
            throw new Exception("UserTransaction ID was null");
        }

        if (originalTransaction.TransactionDate == transaction.TransactionDate)
        {
            await this.Update(PocoFromDto(transaction));

            return new[]
            {
                new TransactionEventDTO { Event = "update", Transaction = transaction },
            };
        }

        originalTransaction.RepeatEndDate = CalculatePreviousOccurrence(originalTransaction.Repeat!, transaction.TransactionDate);

        if (originalTransaction.RepeatEndDate <= originalTransaction.TransactionDate)
        {
            originalTransaction.Repeat = null;
            originalTransaction.RepeatEndDate = null;
        }

        await this.Update(originalTransaction);

        int? transactionId = await this.Database.Insert(PocoFromDto(transaction));

        transaction.TransactionId = transactionId;


        return new[]
        {
            new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) },
            new TransactionEventDTO { Event = "create", Transaction = transaction }
        };
    }

    private static DateTime CalculatePreviousOccurrence(string repeatMode, DateTime date)
    {
        return repeatMode switch
        {
            "weekly" => date.AddDays(-7),
            "monthly" => date.AddMonths(-1),
            "yearly" => date.AddYears(-1),
            _ => throw new Exception("Repeat was not a valid value")
        };
    }

    private static DateTime CalculateNextOccurrence(string repeatMode, DateTime date)
    {
        return repeatMode switch
        {
            "weekly" => date.AddDays(7),
            "monthly" => date.AddMonths(1),
            "yearly" => date.AddYears(1),
            _ => throw new Exception("Repeat was not a valid value")
        };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstanceAndForward(UserTransactionPoco transactionPoco, DateTime instanceDate)
    {
        var previousOccurrence = CalculatePreviousOccurrence(transactionPoco.Repeat!, instanceDate);

        transactionPoco.RepeatEndDate = previousOccurrence;

        if (transactionPoco.TransactionDate >= previousOccurrence)
        {
            transactionPoco.Repeat = null;
            transactionPoco.RepeatEndDate = null;
        }

        await this.Update(transactionPoco);

        return new[] { new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(transactionPoco) } };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstance(UserTransactionPoco transactionPoco, DateTime instanceDate)
    {
        if (transactionPoco!.TransactionDate == instanceDate)
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            var originalRepeatEnd = transactionPoco!.RepeatEndDate;
            string originalRepeat = transactionPoco.Repeat!;

            await this.Delete(transactionPoco);
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "delete", Transaction = UserTransactionDTO.FromPoco(transactionPoco) });
            // deleting the original transaction

            var newStartingDate = CalculateNextOccurrence(originalRepeat, instanceDate);

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(transactionPoco));
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEndDate = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
        else
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            var originalRepeatEnd = transactionPoco!.RepeatEndDate;
            string originalRepeat = transactionPoco.Repeat!;

            var newRepeatEnd = CalculatePreviousOccurrence(originalRepeat, instanceDate);

            if (newRepeatEnd > transactionPoco.TransactionDate)
            {
                transactionPoco.RepeatEndDate = newRepeatEnd;
            }
            else
            {
                transactionPoco.Repeat = null;
                transactionPoco.RepeatEndDate = null;
            }
            
            await this.Update(transactionPoco);
            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(transactionPoco) });
            // updating the transaction original repeat end to previous occurrence

            var newStartingDate = CalculateNextOccurrence(originalRepeat, instanceDate);

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(transactionPoco));
            newRepeatedTransaction.RepeatEndDate = originalRepeatEnd;
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            if (newStartingDate >= originalRepeatEnd)
            {
                newRepeatedTransaction.Repeat = null;
                newRepeatedTransaction.RepeatEndDate = null;
            }

            int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
    }
}
