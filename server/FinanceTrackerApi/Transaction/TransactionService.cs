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
            UserId = dto.UserId
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

    public async Task<TransactionDTO[]> GetAllByMonth(int month, int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction WHERE user_id=@userId AND EXTRACT(MONTH FROM transaction_date)=@month;",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("month", month));

        return pocos.Select(TransactionDTO.FromPoco).ToArray();
    }

    public async Task<TransactionDTO[]> GetAllByUserId(int userId)
    {
        var pocos = await this.Database.Query<TransactionPoco>(
            "SELECT * FROM transaction t WHERE t.user_id=@userId;", new NpgsqlParameter("userId", userId));

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
