using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Category;

public class CategoryDTO
{
    public int? CategoryId { get; set; }
    public string Name { get; set; }
    public string BgColor { get; set; }
    public int Order { get; set; }
    public string Icon { get; set; }
    public int? UserId { get; set; }

    public static CategoryDTO FromPoco(CategoryPoco poco) => new()
    {
        CategoryId = poco.CategoryId,
        BgColor = poco.BackgroundColor,
        Icon = poco.Icon,
        Name = poco.Name,
        Order = poco.ListOrder,
        UserId = poco.UserId,
    };
}
