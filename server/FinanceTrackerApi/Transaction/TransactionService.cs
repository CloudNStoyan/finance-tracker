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

    public static TransactionPoco PocoFromDto(TransactionDTO dto)
    {
        var poco = new TransactionPoco
        {
            Label = dto.Label,
            Type = dto.Type,
            Confirmed = dto.Confirmed,
            Details = dto.Details,
            ImageReceiptId = dto.ImageReceiptId,
            TransactionDate = dto.TransactionDate,
            Value = dto.Value,
            CategoryId = dto.CategoryId,
            UserId = dto.UserId,
            Repeat = dto.Repeat,
            RepeatEnd = dto.RepeatEnd
        };

        if (dto.TransactionId.HasValue)
        {
            poco.TransactionId = dto.TransactionId.Value;
        }

        return poco;
    }

    public async Task<TransactionPoco?> GetById(int transactionId)
    {
        var poco = await this.Database.QueryOne<TransactionPoco>(
            "SELECT * FROM transaction t WHERE t.transaction_id=@transactionId;",
            new NpgsqlParameter("transactionId", transactionId));

        return poco;
    }

    public async Task<TransactionDTO[]> GetAllByDate(DateOnly date, int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction t WHERE t.transaction_date=@transactionDate AND t.user_id=@userId;",
            new NpgsqlParameter("transactionDate", date), new NpgsqlParameter("userId", userId));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetAllByDateRange(DateOnly before, DateOnly after, int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction t WHERE t.user_id=@userId AND (t.transaction_date <= @before AND t.transaction_date >= @after OR t.repeat IS NOT NULL);",
            new NpgsqlParameter("before", before), new NpgsqlParameter("after", after), new NpgsqlParameter("userId", userId));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetAllByMonth(int month, int year, int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction WHERE user_id=@userId AND ((EXTRACT(MONTH FROM transaction_date)=@month AND EXTRACT(YEAR FROM transaction_date)=@year) OR (repeat IS NOT NULL AND repeat != 'yearly' AND transaction_date < @beforeDate) OR (repeat = 'yearly' AND EXTRACT(MONTH FROM transaction_date)=@month));",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("month", month), new NpgsqlParameter("year", year), new NpgsqlParameter("beforeDate", new DateOnly(year, month, 1)));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetTransactionsOnAndBeforeDate(DateOnly date, int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction WHERE user_id=@userId AND transaction_date <= @date;",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("date", date));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetAllByUserId(int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction t WHERE t.user_id=@userId;", new NpgsqlParameter("userId", userId));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetAllBySearchQuery(string searchQuery,int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            @"SELECT * FROM transaction t JOIN category c on t.category_id = c.category_id 
                  WHERE t.user_id=@userId AND t.label ILIKE '%' || @searchQuery || '%' OR c.name ILIKE '%' || @searchQuery || '%' OR t.value::text ILIKE '%' || @searchQuery || '%';",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("searchQuery", searchQuery));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO> Create(TransactionDTO inputDto)
    {
        if (inputDto == null)
        {
            throw new ArgumentNullException(nameof(inputDto));
        }

        var poco = PocoFromDto(inputDto);

        int? transactionId = await Database.Insert(poco);

        var model = TransactionDTO.FromPoco(poco);

        model.TransactionId = transactionId;

        return model;
    }

    public async Task Update(TransactionPoco poco)
    {
        await this.Database.Update(poco);
    }

    public async Task Delete(TransactionPoco poco)
    {
        await this.Database.Delete(poco);
    }

    public async Task<TransactionEventDTO[]> UpdateRepeatInstance(TransactionDTO inputDto)
    {
        if (!inputDto.TransactionId.HasValue)
        {
            throw new Exception("Transaction ID was null");
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

            var newRepeatedTransaction = PocoFromDto(TransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.TransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = TransactionDTO.FromPoco(newRepeatedTransaction) });
            // creating the rest of the series
        }
        else
        {
            var originalRepeatEnd = originalTransaction!.RepeatEnd;

            originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO { Event = "update", Transaction = TransactionDTO.FromPoco(originalTransaction) });
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

            var newRepeatedTransaction = PocoFromDto(TransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.TransactionId = newRepeatedTransactionId!.Value;

            returnTransactionsList.Add(new TransactionEventDTO { Event = "create", Transaction = TransactionDTO.FromPoco(newRepeatedTransaction) }); ;
            // creating the rest of the series
        }

        return returnTransactionsList.ToArray();
    }

    public async Task<TransactionEventDTO[]> UpdateRepeatInstanceAndForward(TransactionDTO inputDto)
    {
        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);

        if (originalTransaction == null)
        {
            throw new Exception("Transaction ID was null");
        }

        var originalRepeatEnd = originalTransaction!.RepeatEnd;

        originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

        inputDto.RepeatEnd = originalRepeatEnd;

        await this.Update(originalTransaction);
        int? transactionId = await Database.Insert(PocoFromDto(inputDto));

        inputDto.TransactionId = transactionId;


        return new[]
        {
            new TransactionEventDTO { Event = "update", Transaction = TransactionDTO.FromPoco(originalTransaction) },
            new TransactionEventDTO { Event = "create", Transaction = inputDto }
        };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstanceAndForward(TransactionDTO inputDto)
    {
        var originalTransaction = await this.GetById(inputDto.TransactionId.Value);

        if (originalTransaction == null)
        {
            throw new Exception("Transaction ID was null");
        }

        originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

        await this.Update(originalTransaction);

        return new[] { new TransactionEventDTO {Event = "update", Transaction = TransactionDTO.FromPoco(originalTransaction) } };
    }

    public async Task<TransactionEventDTO[]> DeleteRepeatInstance(TransactionDTO inputDto)
    {
        if (!inputDto.TransactionId.HasValue)
        {
            throw new Exception("Transaction ID was null");
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

            var newRepeatedTransaction = PocoFromDto(TransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.Repeat = originalRepeat;
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.TransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = TransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
        else
        {
            var returnTransactionsList = new List<TransactionEventDTO>();

            var originalRepeatEnd = originalTransaction!.RepeatEnd;

            originalTransaction.RepeatEnd = inputDto.TransactionDate.Subtract(TimeSpan.FromDays(1));

            await this.Update(originalTransaction);
            returnTransactionsList.Add(new TransactionEventDTO {Event = "update", Transaction = TransactionDTO.FromPoco(originalTransaction)});
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

            var newRepeatedTransaction = PocoFromDto(TransactionDTO.FromPoco(originalTransaction));
            newRepeatedTransaction.RepeatEnd = originalRepeatEnd;
            newRepeatedTransaction.TransactionDate = newStartingDate;

            int? newRepeatedTransactionId = await Database.Insert(newRepeatedTransaction);
            newRepeatedTransaction.TransactionId = newRepeatedTransactionId!.Value;
            returnTransactionsList.Add(new TransactionEventDTO
                { Event = "create", Transaction = TransactionDTO.FromPoco(newRepeatedTransaction) });

            return returnTransactionsList.ToArray();
            // creating the rest of the series
        }
    }
}
