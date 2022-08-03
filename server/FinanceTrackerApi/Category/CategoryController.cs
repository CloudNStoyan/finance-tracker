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

        await this.CategoryService.Delete(category);

        return this.Ok();
    }

    [HttpPut]
    public async Task<ActionResult<CategoryDTO>> Edit([FromBody] CategoryDTO inputDto)
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

        var categoryDto = await this.CategoryService.GetById(inputDto.CategoryId.Value);

        if (categoryDto == null)
        {
            return this.NotFound();
        }

        if (session.UserId == null || session.UserId.Value != categoryDto.UserId.Value)
        {
            return this.Unauthorized();
        }

        inputDto.UserId = session.UserId.Value;

        await this.CategoryService.Update(inputDto);

        return Ok(inputDto);
    }

    [HttpGet]
    public async Task<ActionResult<CategoryDTO>> Get([FromQuery] int? categoryId)
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

        return this.Ok(category);
    }

    [HttpGet("/category/getall")]
    public async Task<ActionResult<CategoryDTO[]>> GetAll()
    {

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        var transactions = await this.CategoryService.GetAllByUserId(session.UserId.Value);

        return this.Ok(transactions);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> Create([FromBody] CategoryDTO inputDto)
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

        inputDto.UserId = this.SessionService.Session.UserId;

        var category = await this.CategoryService.Create(inputDto);

        return CreatedAtAction(nameof(this.Create), category);
    }
}
