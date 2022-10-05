using FinanceTrackerApi.DAL;
using FinanceTrackerApi.Transaction;
using Npgsql;

namespace FinanceTrackerApi.Category;

// ReSharper disable once ClassNeverInstantiated.Global
public class CategoryService
{
    private Database Database { get; }

    public CategoryService(Database database)
    {
        this.Database = database;
    }

    public async Task MoveAllTransactionsByCatId(int catId, int userId)
    {
        await this.Database.ExecuteNonQuery(
            "UPDATE transaction SET category_id = null WHERE user_id=@userId AND category_id=@catId;",
            new NpgsqlParameter("userId", userId), new NpgsqlParameter("catId", catId));
    }

    public async Task<bool> CategoryHasTransactions(int categoryId, int userId)
    {
        return await this.Database.Execute<bool>("SELECT EXISTS(SELECT * FROM user_transactions WHERE user_id=@userId AND category_id = @catId)",
            new NpgsqlParameter("catId", categoryId), new NpgsqlParameter("userId", userId));
    }

    public async Task<CategoryPoco?> GetById(int catId)
    {
        var poco = await this.Database.QueryOne<CategoryPoco>(
            "SELECT * FROM categories c WHERE c.category_id=@catId;",
            new NpgsqlParameter("catId", catId));

        return poco;
    }

    public async Task<CategoryPoco[]> GetAllByUserId(int userId)
    {
        var pocos = await this.Database.Query<CategoryPoco>(
            "SELECT * FROM categories c WHERE c.user_id=@userId;",
            new NpgsqlParameter("userId", userId));

        return pocos.ToArray();
    }

    public async Task<CategoryPoco?> Create(CategoryPoco poco)
    {
        if (poco == null)
        {
            throw new ArgumentNullException(nameof(poco));
        }

        int? categoryId = await this.Database.Insert(poco);

        if (!categoryId.HasValue)
        {
            return null;
        }

        poco.CategoryId = categoryId.Value;

        return poco;
    }

    public async Task Update(CategoryPoco poco)
    {
        await this.Database.Update(poco);
    }

    public async Task Delete(CategoryPoco poco)
    {
        await this.Database.Delete(poco);
    }
}
