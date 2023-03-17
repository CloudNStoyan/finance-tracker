using FinanceTrackerApi.DAL;
using FinanceTrackerApi.Infrastructure;
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
            transaction.RepeatEndDate = null;
            transaction.Repeat = null;
            transaction.RepeatEndType = null;
            transaction.RepeatEndOccurrences = null;
            transaction.RepeatEvery = null;

            await this.Update(PocoFromDto(transaction));

            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = transaction });
            // updating the transaction original repeat end to null

            if (originalTransaction.RepeatEndType == "on")
            {
                var newStartingDate = TransactionBusinessLogic.GetNextOccurrenceDate(originalTransaction.Repeat!, transaction.TransactionDate, originalTransaction.RepeatEvery!.Value);

                if (newStartingDate > originalTransaction.RepeatEndDate)
                {
                    // we only want to create the new series of transactions only if there are occurrences left
                    return returnTransactionsList.ToArray();
                }

                var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
                newRepeatedTransaction.TransactionDate = newStartingDate;

                if (newStartingDate == originalTransaction.RepeatEndDate)
                {
                    newRepeatedTransaction.Repeat = null;
                    newRepeatedTransaction.RepeatEndDate = null;
                }

                int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
                newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
                returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
                // creating the rest of the series
            }

            if (originalTransaction.RepeatEndType == "after")
            {
                var newStartingDate = TransactionBusinessLogic.GetNextOccurrenceDate(originalTransaction.Repeat!,
                    originalTransaction.TransactionDate, originalTransaction.RepeatEvery!.Value);

                decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(newStartingDate, originalTransaction.TransactionDate, originalTransaction.Repeat!, originalTransaction.RepeatEvery!.Value, null);

                if (originalTransaction.RepeatEndOccurrences is not null && occurrences > originalTransaction.RepeatEndOccurrences.Value)
                {
                    return returnTransactionsList.ToArray();
                }

                var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
                newRepeatedTransaction.TransactionDate = newStartingDate;
                newRepeatedTransaction.RepeatEndOccurrences = originalTransaction.RepeatEndOccurrences!.Value - (int)occurrences;

                if (occurrences == originalTransaction.RepeatEndOccurrences)
                {
                    newRepeatedTransaction.Repeat = null;
                    newRepeatedTransaction.RepeatEndType = null;
                    newRepeatedTransaction.RepeatEndOccurrences = null;
                }

                int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
                newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
                returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
                // creating the rest of the series
            }
        }
        else
        {
            var originalRepeatEndDate = originalTransaction.RepeatEndDate;
            string? originalRepeat = originalTransaction.Repeat;
            int? originalRepeatEvery = originalTransaction.RepeatEvery;
            int? originalRepeatEndOccurrences = originalTransaction.RepeatEndOccurrences;
            string? originalRepeatEndType = originalTransaction.RepeatEndType;

            if (originalRepeatEndType == "on")
            {
                originalTransaction.RepeatEndDate = TransactionBusinessLogic.GetPreviousOccurrenceDate(originalRepeat!, transaction.TransactionDate, originalRepeatEvery!.Value);

                if (originalTransaction.RepeatEndDate <= originalTransaction.TransactionDate)
                {
                    originalTransaction.Repeat = null;
                    originalTransaction.RepeatEndDate = null;
                    originalTransaction.RepeatEndType = null;
                    originalTransaction.RepeatEvery = null;
                }
            }

            if (originalRepeatEndType == "after")
            {
                var previousOccurrence = TransactionBusinessLogic.GetPreviousOccurrenceDate(originalRepeat!, transaction.TransactionDate, originalRepeatEvery!.Value);

                decimal occurrencesBetweenDates = TransactionBusinessLogic.GetOccurrencesBetweenDates(previousOccurrence,
                    originalTransaction.TransactionDate, originalRepeat!, originalRepeatEvery!.Value,
                    originalRepeatEndOccurrences);

                originalTransaction.RepeatEndOccurrences = (int)occurrencesBetweenDates;

                if (previousOccurrence <= originalTransaction.TransactionDate)
                {
                    originalTransaction.Repeat = null;
                    originalTransaction.RepeatEndOccurrences = null;
                    originalTransaction.RepeatEndType = null;
                    originalTransaction.RepeatEvery = null;
                }
            }
            

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) });
            // updating the transaction original repeat end to before this day

            int? transactionId = await this.Database.Insert(PocoFromDto(transaction));
            transaction.TransactionId = transactionId;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = transaction });
            // creating the new transaction for this day only

            var newStartingDate = TransactionBusinessLogic.GetNextOccurrenceDate(originalRepeat!, transaction.TransactionDate, originalRepeatEvery!.Value);
            decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(
                newStartingDate, transaction.TransactionDate, originalRepeat!, originalRepeatEvery!.Value, null);
            
            bool noOccurrencesLeft = originalRepeatEndOccurrences - (int)occurrences < 1 || occurrences > originalRepeatEndOccurrences;

            if ((originalRepeatEndType == "on" && newStartingDate > originalRepeatEndDate) || (originalRepeatEndType == "after" && noOccurrencesLeft))
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEndDate = originalRepeatEndDate;
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEvery = originalRepeatEvery;
            newRepeatedTransaction.RepeatEndOccurrences = originalRepeatEndOccurrences - (int)occurrences;
            newRepeatedTransaction.RepeatEndType = originalRepeatEndType;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            if ((originalRepeatEndType == "on" && newStartingDate == originalRepeatEndDate) || (originalRepeatEndType == "after" && newRepeatedTransaction.RepeatEndOccurrences < 2))
            {
                newRepeatedTransaction.Repeat = null;
                newRepeatedTransaction.RepeatEndDate = null;
                newRepeatedTransaction.RepeatEndOccurrences = null;
                newRepeatedTransaction.RepeatEndType = null;
                newRepeatedTransaction.RepeatEvery = null;
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

        string? originalRepeat = originalTransaction.Repeat;
        int? originalRepeatEvery = originalTransaction.RepeatEvery;
        string? originalRepeatEndType = originalTransaction.RepeatEndType;


        var previousOccurrenceDate = TransactionBusinessLogic.GetPreviousOccurrenceDate(originalRepeat!,
            transaction.TransactionDate, transaction.RepeatEvery!.Value);

        if (originalRepeatEndType == "on")
        {
            originalTransaction.RepeatEndDate = previousOccurrenceDate;

            if (originalTransaction.RepeatEndDate <= originalTransaction.TransactionDate)
            {
                originalTransaction.Repeat = null;
                originalTransaction.RepeatEndDate = null;
                originalTransaction.RepeatEndType = null;
                originalTransaction.RepeatEvery = null;
            }
        }

        decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(previousOccurrenceDate, originalTransaction.TransactionDate, originalRepeat!, originalRepeatEvery!.Value, null);

        if (originalRepeatEndType == "after")
        {
            originalTransaction.RepeatEndOccurrences = (int)occurrences;

            if (originalTransaction.RepeatEndOccurrences < 2)
            {
                originalTransaction.Repeat = null;
                originalTransaction.RepeatEndOccurrences = null;
                originalTransaction.RepeatEndType = null;
                originalTransaction.RepeatEvery = null;
            }
        }

        await this.Update(originalTransaction);

        var newTransaction = PocoFromDto(transaction);

        if (originalRepeatEndType == "after")
        {
            newTransaction.RepeatEndOccurrences -= (int)occurrences;
        }

        int? transactionId = await this.Database.Insert(newTransaction);

        newTransaction.UserTransactionId = transactionId!.Value;

        return new[]
        {
            new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) },
            new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newTransaction) }
        };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstanceAndForward(UserTransactionPoco transactionPoco, DateTime instanceDate)
    {
        var previousOccurrence = TransactionBusinessLogic.GetPreviousOccurrenceDate(transactionPoco.Repeat!, instanceDate, transactionPoco.RepeatEvery!.Value);

        if (transactionPoco.RepeatEndType == "on")
        {
            transactionPoco.RepeatEndDate = previousOccurrence;

            if (transactionPoco.TransactionDate >= previousOccurrence)
            {
                transactionPoco.Repeat = null;
                transactionPoco.RepeatEndDate = null;
                transactionPoco.RepeatEndType = null;
                transactionPoco.RepeatEvery = null;
            }
        }

        if (transactionPoco.RepeatEndType == "after")
        {
            decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(instanceDate, transactionPoco.TransactionDate, transactionPoco.Repeat!, transactionPoco.RepeatEvery!.Value, null);

            transactionPoco.RepeatEndOccurrences -= ((int)occurrences - 1);

            if (transactionPoco.RepeatEndOccurrences < 2)
            {
                transactionPoco.Repeat = null;
                transactionPoco.RepeatEndOccurrences = null;
                transactionPoco.RepeatEndType = null;
                transactionPoco.RepeatEvery = null;
            }
        }

        await this.Update(transactionPoco);

        return new[] { new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(transactionPoco) } };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstance(UserTransactionPoco transactionPoco, DateTime instanceDate)
    {
        var originalRepeatEnd = transactionPoco!.RepeatEndDate;
        string originalRepeat = transactionPoco.Repeat!;
        string? originalRepeatEndType = transactionPoco.RepeatEndType;
        int? originalRepeatEndOccurrences = transactionPoco.RepeatEndOccurrences;
        int originalRepeatEvery = transactionPoco.RepeatEvery!.Value;

        if (transactionPoco!.TransactionDate == instanceDate)
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            await this.Delete(transactionPoco);

            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "delete", Transaction = UserTransactionDTO.FromPoco(transactionPoco) });
            // deleting the original transaction

            var newStartingDate = TransactionBusinessLogic.GetNextOccurrenceDate(originalRepeat, instanceDate, originalRepeatEvery);

            if (originalRepeatEndType == "on")
            {
                if (newStartingDate > originalRepeatEnd)
                {
                    // we only want to create the new series of transactions only if there are occurrences left
                    return returnTransactionsList.ToArray();
                }

                var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(transactionPoco));
                newRepeatedTransaction.Repeat = originalRepeat;
                newRepeatedTransaction.RepeatEndDate = originalRepeatEnd;
                newRepeatedTransaction.TransactionDate = newStartingDate;
                newRepeatedTransaction.RepeatEndType = originalRepeatEndType;

                int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
                newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
                returnTransactionsList.Add(new TransactionEventDTO
                    { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
            }

            if (originalRepeatEndType == "after")
            {
                if (transactionPoco.RepeatEndOccurrences < 2)
                {
                    return returnTransactionsList.ToArray();
                }

                var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(transactionPoco));
                newRepeatedTransaction.Repeat = originalRepeat;
                newRepeatedTransaction.TransactionDate = newStartingDate;
                newRepeatedTransaction.RepeatEndOccurrences = originalRepeatEndOccurrences - 1;
                newRepeatedTransaction.RepeatEndType = originalRepeatEndType;

                int? newRepeatedTransactionId = await this.Database.Insert(newRepeatedTransaction);
                newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
                returnTransactionsList.Add(new TransactionEventDTO
                    { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
            }

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
        else
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            if (originalRepeatEndType == "on")
            {
                var newRepeatEnd = TransactionBusinessLogic.GetPreviousOccurrenceDate(originalRepeat, instanceDate, transactionPoco.RepeatEvery!.Value);

                if (newRepeatEnd > transactionPoco.TransactionDate)
                {
                    transactionPoco.RepeatEndDate = newRepeatEnd;
                }
                else
                {
                    transactionPoco.Repeat = null;
                    transactionPoco.RepeatEndDate = null;
                }
            }

            decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(instanceDate, transactionPoco.TransactionDate, originalRepeat!, originalRepeatEvery, null);

            if (originalRepeatEndType == "after")
            {
                transactionPoco.RepeatEndOccurrences -= (int)occurrences;

                if (transactionPoco.RepeatEndOccurrences < 2)
                {
                    transactionPoco.Repeat = null;
                    transactionPoco.RepeatEndOccurrences = null;
                    transactionPoco.RepeatEndType = null;
                    transactionPoco.RepeatEvery = null;
                }
            }
            
            await this.Update(transactionPoco);
            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(transactionPoco) });
            // updating the transaction original repeat end to previous occurrence

            var newStartingDate = TransactionBusinessLogic.GetNextOccurrenceDate(originalRepeat, instanceDate, originalRepeatEvery);

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(transactionPoco));
            newRepeatedTransaction.RepeatEndDate = originalRepeatEnd;
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEndType = originalRepeatEndType;
            newRepeatedTransaction.RepeatEndOccurrences = originalRepeatEndOccurrences;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            if (newRepeatedTransaction.RepeatEndType == "on" && newStartingDate >= originalRepeatEnd)
            {
                newRepeatedTransaction.Repeat = null;
                newRepeatedTransaction.RepeatEndDate = null;
                newRepeatedTransaction.RepeatEndType = null;
                newRepeatedTransaction.RepeatEvery = null;
            }

            if (newRepeatedTransaction.RepeatEndType == "after")
            {
                newRepeatedTransaction.RepeatEndOccurrences -= ((int)occurrences + 1);

                if (newRepeatedTransaction.RepeatEndOccurrences < 2)
                {
                    newRepeatedTransaction.Repeat = null;
                    newRepeatedTransaction.RepeatEndOccurrences = null;
                    newRepeatedTransaction.RepeatEndType = null;
                    newRepeatedTransaction.RepeatEvery = null;
                }
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
