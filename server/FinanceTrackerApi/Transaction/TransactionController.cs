using FinanceTrackerApi.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTrackerApi.Transaction;

[ApiController]
[Route("[controller]")]
public class TransactionController : ControllerBase
{
    private TransactionService TransactionService { get; }

    public TransactionController(TransactionService transactionService)
    {
        this.TransactionService = transactionService;
    }

    public async Task<ActionResult> Delete([FromQuery] int? transactionId)
    {
        if (transactionId == null)
        {
            return this.BadRequest();
        }

        var transaction = await this.TransactionService.GetById(transactionId.Value);

        if (transaction == null)
        {
            return this.NotFound();
        }

        await this.TransactionService.Delete(transaction);

        return this.Ok();
    }

    [HttpPut]
    public async Task<ActionResult<TransactionDTO>> Edit([FromBody] TransactionDTO inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        await this.TransactionService.Update(inputDto);

        return Ok(inputDto);
    }

    [HttpGet]
    public async Task<ActionResult<TransactionDTO>> Get([FromQuery] int? transactionId, [FromQuery] DateTime? transactionDate)
    {
        if (transactionId.HasValue)
        {
            var transactionDto = await this.TransactionService.GetById(transactionId.Value);

            if (transactionDto == null)
            {
                return this.NotFound();
            }

            return this.Ok(transactionDto);
        }

        if (transactionDate.HasValue)
        {
            var transactionDto = await this.TransactionService.GetByDate(DateOnly.FromDateTime(transactionDate.Value));

            if (transactionDto == null)
            {
                return this.NotFound();
            }

            return this.Ok(transactionDto);
        }

        return this.BadRequest();
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDTO>> Create([FromBody] TransactionDTO inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        var model = await this.TransactionService.Create(inputDto);

        return CreatedAtAction(nameof(this.Create), model);
    }
}
