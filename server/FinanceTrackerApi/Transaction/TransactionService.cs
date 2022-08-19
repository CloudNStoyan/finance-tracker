﻿using FinanceTrackerApi.DAL;
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
            Repeat = dto.Repeat
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

    public async Task<decimal> GetBalanceBeforeDate(DateOnly date, int userId)
    {
        const string sql = @"
        SELECT (
            COALESCE(sum(
                case when type = 'income' then
                    case when repeat = 'weekly' then ((((@fullDate - transaction_date) / 7) + 1) * value)
                        else case when repeat = 'monthly' then (((DATE_PART('year', AGE(@fullDate, transaction_date)) * 12) + DATE_PART('month', AGE(@fullDate, transaction_date)) + 1) * value)
                            else case when repeat = 'yearly' then (((DATE_PART('year', AGE(@fullDate, transaction_date)) + 1)) * value)
                                else value
                end end end
            else
                case when repeat = 'weekly' then ((((@fullDate - transaction_date) / 7) + 1) * value) * -1
                    else case when repeat = 'monthly' then (((DATE_PART('year', AGE(@fullDate, transaction_date)) * 12) + DATE_PART('month', AGE(@fullDate, transaction_date)) + 1) * value) * -1
                        else case when repeat = 'yearly' then (((DATE_PART('year', AGE(@fullDate, transaction_date)) + 1)) * value) * -1
                            else value * -1
                end end end
            end
            ), 0::money)
    ) FROM transaction WHERE user_id=@userId AND transaction_date < @fullDate;";

        return await this.Database.Execute<decimal>(
            sql,
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("fullDate", date));
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
}
