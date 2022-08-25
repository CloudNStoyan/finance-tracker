using FinanceTrackerApi.DAL;
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
            RepeatEnd = dto.RepeatEnd
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

        int? transactionId = await Database.Insert(poco);

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

    public async Task<TransactionEventDTO[]> UpdateRepeatInstance(UserTransactionDTO inputDto)
    {
        if (!inputDto.TransactionId.HasValue)
        {
            throw new Exception("UserTransaction ID was null");
        }

        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);

        var returnTransactionsList = new List<TransactionEventDTO>();

        if (originalTransaction!.TransactionDate == inputDto.TransactionDate)
        {
            var originalRepeatEnd = originalTransaction!.RepeatEnd;
            string? originalRepeat = originalTransaction.Repeat;

            inputDto.RepeatEnd = null;
            inputDto.Repeat = null;

            await this.Update(PocoFromDto(inputDto));
            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = inputDto });
            // updating the transaction original repeat end to before this day

            var newStartingDate = inputDto.TransactionDate;

            if (originalRepeat == "weekly")
            {
                newStartingDate = newStartingDate.AddDays(7);
            }

            if (originalRepeat == "monthly")
            {
                newStartingDate = newStartingDate.AddMonths(1);
            }

            if (originalRepeat == "yearly")
            {
                newStartingDate = newStartingDate.AddYears(1);
            }

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });
            // creating the rest of the series
        }
        else
        {
            var originalRepeatEnd = originalTransaction!.RepeatEnd;

            originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) });
            // updating the transaction original repeat end to before this day

            inputDto.Repeat = null;
            inputDto.RepeatEnd = null;

            int? transactionId = await Database.Insert(PocoFromDto(inputDto));
            inputDto.TransactionId = transactionId;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = inputDto });
            // creating the new transaction for this day only

            var newStartingDate = inputDto.TransactionDate;

            if (originalTransaction.Repeat == "weekly")
            {
                newStartingDate = newStartingDate.AddDays(7);
            }

            if (originalTransaction.Repeat == "monthly")
            {
                newStartingDate = newStartingDate.AddMonths(1);
            }

            if (originalTransaction.Repeat == "yearly")
            {
                newStartingDate = newStartingDate.AddYears(1);
            }

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;

            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) }); ;
            // creating the rest of the series
        }

        return returnTransactionsList.ToArray();
    }

    public async Task<TransactionEventDTO[]> UpdateRepeatInstanceAndForward(UserTransactionDTO inputDto)
    {
        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);

        if (originalTransaction == null)
        {
            throw new Exception("UserTransaction ID was null");
        }

        if (originalTransaction.TransactionDate == inputDto.TransactionDate)
        {
            await this.Update(PocoFromDto(inputDto));

            return new[]
            {
                new TransactionEventDTO { Event = "update", Transaction = inputDto },
            };
        }

        var originalRepeatEnd = originalTransaction!.RepeatEnd;

        originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

        inputDto.RepeatEnd = originalRepeatEnd;

        await this.Update(originalTransaction);
        int? transactionId = await Database.Insert(PocoFromDto(inputDto));

        inputDto.TransactionId = transactionId;


        return new[]
        {
            new TransactionEventDTO { Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) },
            new TransactionEventDTO { Event = "create", Transaction = inputDto }
        };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstanceAndForward(UserTransactionDTO inputDto)
    {
        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);

        if (originalTransaction == null)
        {
            throw new Exception("UserTransaction ID was null");
        }

        originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

        await this.Update(originalTransaction);

        return new[] { new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction) } };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstance(UserTransactionDTO inputDto)
    {
        if (!inputDto.TransactionId.HasValue)
        {
            throw new Exception("UserTransaction ID was null");
        }

        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);


        if (originalTransaction!.TransactionDate == inputDto.TransactionDate)
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            var originalRepeatEnd = originalTransaction!.RepeatEnd;
            string? originalRepeat = originalTransaction.Repeat;

            await this.Delete(PocoFromDto(inputDto));
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "delete", Transaction = inputDto });
            // deleting the original transaction

            var newStartingDate = inputDto.TransactionDate;

            if (originalRepeat == "weekly")
            {
                newStartingDate = newStartingDate.AddDays(7);
            }

            if (originalRepeat == "monthly")
            {
                newStartingDate = newStartingDate.AddMonths(1);
            }

            if (originalRepeat == "yearly")
            {
                newStartingDate = newStartingDate.AddYears(1);
            }

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
        else
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            var originalRepeatEnd = originalTransaction!.RepeatEnd;

            originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = UserTransactionDTO.FromPoco(originalTransaction)});
            // updating the transaction original repeat end to before this day

            var newStartingDate = inputDto.TransactionDate;

            if (originalTransaction.Repeat == "weekly")
            {
                newStartingDate = newStartingDate.AddDays(7);
            }

            if (originalTransaction.Repeat == "monthly")
            {
                newStartingDate = newStartingDate.AddMonths(1);
            }

            if (originalTransaction.Repeat == "yearly")
            {
                newStartingDate = newStartingDate.AddYears(1);
            }

            if (newStartingDate > originalRepeatEnd)
            {
                // we only want to create the new series of transactions only if there are occurrences left
                return returnTransactionsList.ToArray();
            }

            var newRepeatedTransaction = PocoFromDto(UserTransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.UserTransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = UserTransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
    }
}
