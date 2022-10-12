using FinanceTrackerApi.Auth;
using FinanceTrackerApi.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTrackerApi.Category;

[ApiController]
[Route("[controller]")]
public class CategoryController : ControllerBase
{
    private CategoryService CategoryService { get; }
    private SessionService SessionService { get; }

    public CategoryController(CategoryService categoryService, SessionService sessionService)
    {
        this.CategoryService = categoryService;
        this.SessionService = sessionService;
    }

    [HttpDelete]
    public async Task<ActionResult> Delete([FromQuery] int? categoryId)
    {
        if (categoryId == null)
        {
            return this.BadRequest();
        }

        var category = await this.CategoryService.GetById(categoryId.Value);

        if (category == null)
        {
            return this.NotFound();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !category.UserId.HasValue || category.UserId != session.UserId)
        {
            return this.Unauthorized();
        }

        bool hasTransactions = await this.CategoryService.CategoryHasTransactions(categoryId.Value, session.UserId.Value);

        if (hasTransactions)
        {
            await this.CategoryService.MoveAllTransactionsByCatId(categoryId.Value, session.UserId.Value);
        }

        await this.CategoryService.Delete(category);

        return this.Ok();
    }

    [HttpPut]
    public async Task<ActionResult<RequestCategory>> Edit([FromBody] RequestCategory inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        if (!inputDto.CategoryId.HasValue)
        {
            return this.BadRequest();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.Unauthorized();
        }

        var categoryPoco = await this.CategoryService.GetById(inputDto.CategoryId.Value);

        if (categoryPoco == null)
        {
            return this.NotFound();
        }

        if (session.UserId == null || session.UserId.Value != categoryPoco.UserId!.Value)
        {
            return this.Unauthorized();
        }

        await this.CategoryService.Update(categoryPoco);

        return this.Ok(inputDto);
    }

    [HttpGet]
    public async Task<ActionResult<RequestCategory>> Get([FromQuery] int? categoryId)
    {
        if (!categoryId.HasValue)
        {
            return this.BadRequest();
        }

        var category = await this.CategoryService.GetById(categoryId.Value);

        if (category == null)
        {
            return this.NotFound();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !category.UserId.HasValue || category.UserId != session.UserId)
        {
            return this.Unauthorized();
        }

        return this.Ok(RequestCategory.FromPoco(category));
    }

    [HttpGet("/category/getall")]
    public async Task<ActionResult<RequestCategory[]>> GetAll()
    {

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        var pocoCategories = await this.CategoryService.GetAllByUserId(session.UserId.Value);

        var categories = pocoCategories.Select(RequestCategory.FromPoco).ToList();

        categories.Sort((firstCat, secondCat) => firstCat.Name.CompareTo(secondCat.Name));

        return this.Ok(categories.ToArray());
    }

    [HttpPost]
    public async Task<ActionResult<RequestCategory>> Create([FromBody] RequestCategory inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.Unauthorized();
        }

        var poco = inputDto.ToPoco();

        poco.UserId = this.SessionService.Session.UserId;

        var category = await this.CategoryService.Create(poco);

        return this.CreatedAtAction(nameof(this.Create), RequestCategory.FromPoco(category));
    }
}
