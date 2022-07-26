using FinanceTrackerApi.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTrackerApi.Category;

[ApiController]
[Route("[controller]")]
public class CategoryController : ControllerBase
{
    private CategoryService CategoryService { get; }

    public CategoryController(CategoryService categoryService)
    {
        this.CategoryService = categoryService;
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

        return this.Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDTO>> Create([FromBody] CategoryDTO inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        var category = await this.CategoryService.Create(inputDto);

        return CreatedAtAction(nameof(this.Create), category);
    }
}
