using FinanceTrackerApi.Auth;
using FinanceTrackerApi.DAL;
using FinanceTrackerApi.Infrastructure;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTrackerApi.Transaction;

[ApiController]
[Route("[controller]")]
public class TransactionController : ControllerBase
{
    private TransactionService TransactionService { get; }
    private SessionService SessionService { get; }

    public TransactionController(TransactionService transactionService, SessionService sessionService)
    {
        this.TransactionService = transactionService;
        this.SessionService = sessionService;
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

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !transaction.UserId.HasValue || transaction.UserId != session.UserId)
        {
            return this.Unauthorized();
        }

        await this.TransactionService.Delete(transaction);

        return this.Ok();
    }

    [HttpPut]
    public async Task<ActionResult<TransactionDTO>> Edit([FromBody] TransactionDTO inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid || !inputDto.TransactionId.HasValue)
        {
            return this.BadRequest();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.Unauthorized();
        }

        var transaction = await this.TransactionService.GetById(inputDto.TransactionId.Value);

        if (transaction == null)
        {
            return this.NotFound();
        }

        if (transaction.UserId!.Value != session.UserId!.Value)
        {
            return this.Unauthorized();
        }

        inputDto.UserId = session.UserId;

        await this.TransactionService.Update(TransactionService.PocoFromDto(inputDto));

        return Ok(inputDto);
    }

    [HttpGet]
    public async Task<ActionResult<TransactionDTO>> Get([FromQuery] int? transactionId)
    {
        if (!transactionId.HasValue)
        {
            return this.BadRequest();
        }

        var transaction = await this.TransactionService.GetById(transactionId.Value);

        if (transaction == null)
        {
            return this.NotFound();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !transaction.UserId.HasValue || transaction.UserId != session.UserId)
        {
            return this.Unauthorized();
        }

        return this.Ok(transaction);
    }

    [HttpGet("/transaction/all")]
    public async Task<ActionResult<TransactionDTO[]>> GetAll()
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        return this.Ok(await this.TransactionService.GetAllByUserId(session.UserId.Value));
    }

    [HttpGet("/transaction/all/date")]
    public async Task<ActionResult<TransactionDTO[]>> GetAllByDate([FromQuery] DateTime? transactionDate)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        if (!transactionDate.HasValue)
        {
            return this.Ok(await this.TransactionService.GetAllByUserId(session.UserId.Value));
        }

        return this.Ok(await this.TransactionService.GetAllByDate(DateOnly.FromDateTime(transactionDate!.Value), session.UserId.Value));
    }

    [HttpGet("/transaction/all/month")]
    public async Task<ActionResult<TransactionDTO[]>> GetAllByMonth([FromQuery] int month)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        return this.Ok(await this.TransactionService.GetAllByMonth(month, session.UserId.Value));
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDTO>> Create([FromBody] TransactionDTO inputDto)
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

        var model = await this.TransactionService.Create(inputDto);

        return CreatedAtAction(nameof(this.Create), model);
    }
}
