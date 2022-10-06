using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Category;

public class RequestCategory
{
    public int? CategoryId { get; set; }
    public string Name { get; set; }
    public string BgColor { get; set; }
    public int Order { get; set; }
    public string Icon { get; set; }

    public static RequestCategory FromPoco(CategoryPoco poco) => new()
    {
        CategoryId = poco.CategoryId,
        BgColor = poco.BackgroundColor,
        Icon = poco.Icon,
        Name = poco.Name,
    };

    public CategoryPoco ToPoco() => new()
    {
        CategoryId = this.CategoryId.GetValueOrDefault(0),
        BackgroundColor = this.BgColor,
        Icon = this.Icon,
        Name = this.Name,
    };
}
