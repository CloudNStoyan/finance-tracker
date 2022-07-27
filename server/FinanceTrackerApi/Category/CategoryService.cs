using FinanceTrackerApi.DAL;
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

    private static CategoryPoco PocoFromDto(CategoryDTO dto)
    {
        var poco = new CategoryPoco
        {
            Name = dto.Name,
            BackgroundColor = dto.BgColor,
            Icon = dto.Icon,
            ListOrder = dto.Order,
            TextColor = dto.TextColor,
            UserId = dto.UserId
        };

        if (dto.CategoryId.HasValue)
        {
            poco.CategoryId = dto.CategoryId.Value;
        }

        if (dto.UserId.HasValue)
        {
            poco.UserId = dto.UserId.Value;
        }

        return poco;
    }

    public async Task<CategoryDTO?> GetById(int catId)
    {
        var poco = await this.Database.QueryOne<CategoryPoco>(
            "SELECT * FROM category c WHERE c.category_id=@catId;",
            new NpgsqlParameter("catId", catId));

        if (poco == null)
        {
            return null;
        }

        var model = CategoryDTO.FromPoco(poco);

        return model;
    }

    public async Task<CategoryDTO?> Create(CategoryDTO inputDto)
    {
        if (inputDto == null)
        {
            throw new ArgumentNullException(nameof(inputDto));
        }

        var poco = PocoFromDto(inputDto);

        int? categoryId = await this.Database.Insert(poco);

        if (!categoryId.HasValue)
        {
            return null;
        }

        var dto = CategoryDTO.FromPoco(poco);

        dto.CategoryId = categoryId;

        return dto;
    }

    public async Task Update(CategoryDTO inputDto)
    {
        await this.Database.Update(PocoFromDto(inputDto));
    }

    public async Task Delete(CategoryDTO inputDto)
    {
        await this.Database.Delete(PocoFromDto(inputDto));
    }
}
