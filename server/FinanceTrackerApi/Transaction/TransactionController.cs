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

    public async Task<ActionResult<TransactionEventDTO[]>> Delete([FromQuery] int? transactionId, [FromQuery] bool? onlyThis, [FromQuery] DateTime instanceDate)
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

        if (transaction.Repeat != null)
        {
            if (onlyThis is true)
            {
                return this.Ok(await this.TransactionService.DeleteRepeatInstance(transaction, instanceDate));
            }

            if (instanceDate != transaction.TransactionDate)
            {
                return this.Ok(await this.TransactionService.DeleteRepeatInstanceAndForward(transaction, instanceDate));
            }
        }

        await this.TransactionService.Delete(transaction);

        return this.Ok(new[] { new TransactionEventDTO{Event = "delete", Transaction = UserTransactionDTO.FromPoco(transaction) } });
    }

    [HttpPut]
    public async Task<ActionResult<TransactionEventDTO[]>> Edit([FromBody] UserTransactionDTO inputDto, [FromQuery] bool? onlyThis)
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

        if (inputDto.Repeat != null)
        {
            if (onlyThis.HasValue && onlyThis.Value)
            {
                return this.Ok(await this.TransactionService.UpdateRepeatInstance(inputDto));
            }

            return this.Ok(await this.TransactionService.UpdateRepeatInstanceAndForward(inputDto));
        }
        
        await this.TransactionService.Update(TransactionService.PocoFromDto(inputDto));

        return this.Ok(new[] { new TransactionEventDTO { Event = "update", Transaction = inputDto }});
    }

    [HttpGet]
    public async Task<ActionResult<UserTransactionDTO>> Get([FromQuery] int? transactionId)
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

        return this.Ok(UserTransactionDTO.FromPoco(transaction));
    }

    [HttpGet("/transaction/all/search")]
    public async Task<ActionResult<UserTransactionDTO[]>> GetAllBySearch([FromQuery] string searchQuery)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        return this.Ok(await this.TransactionService.GetAllBySearchQuery(searchQuery,session.UserId.Value));
    }

    [HttpGet("/transaction/all/date")]
    public async Task<ActionResult<UserTransactionDTO[]>> GetAllByDate([FromQuery] DateTime? transactionDate)
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

    [HttpGet("/transaction/all/range")]
    public async Task<ActionResult<UserTransactionDTO[]>> GetAllByDateRange([FromQuery] DateTime? beforeDate, [FromQuery] DateTime? afterDate)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        if (!beforeDate.HasValue || !afterDate.HasValue)
        {
            return this.BadRequest();
        }

        var transactions = await this.TransactionService.GetAllByDateRange(DateOnly.FromDateTime(beforeDate!.Value),
            DateOnly.FromDateTime(afterDate!.Value), session.UserId.Value);

        var filteredTransactions = transactions.Where(transaction => transaction.TransactionDate >= beforeDate.Value).ToArray();

        return this.Ok(transactions);
    }

    [HttpGet("/transaction/balance")]
    public async Task<ActionResult<decimal>> GetBalanceByDate([FromQuery] DateTime? date)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        if (!date.HasValue)
        {
            return this.BadRequest();
        }

        var transactions = await this.TransactionService.GetTransactionsOnAndBeforeDate(
            DateOnly.FromDateTime(date!.Value),
            session.UserId.Value);

        decimal balance = 0;

        foreach (var transaction in transactions)
        {
            decimal transactionValue = transaction.Value;

            if (transaction.Repeat is not null)
            {
                var untilDate = transaction.RepeatEndType == "on" && (transaction.RepeatEndDate!.Value < date.Value) ? transaction.RepeatEndDate.Value : date.Value;

                decimal occurrences = TransactionBusinessLogic.GetOccurrencesBetweenDates(untilDate, transaction.TransactionDate, transaction.Repeat, transaction.RepeatEvery!.Value, transaction.RepeatEndOccurrences);

                transactionValue *= occurrences;
            }


            if (transaction.Type == "expense")
            {
                balance -= transactionValue;
            }
            else
            {
                balance += transactionValue;
            }
        }

        return this.Ok(new BalanceDTO {Balance = balance});
    }

    [HttpGet("/transaction/all/month")]
    public async Task<ActionResult<UserTransactionDTO[]>> GetAllByMonth([FromQuery] int month, [FromQuery] int year)
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !session.UserId.HasValue)
        {
            return this.Unauthorized();
        }

        return this.Ok(await this.TransactionService.GetAllByMonth(month,year, session.UserId.Value));
    }

    [HttpPost]
    public async Task<ActionResult<TransactionEventDTO[]>> Create([FromBody] UserTransactionDTO inputDto)
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

        return CreatedAtAction(nameof(this.Create), new[]{ new TransactionEventDTO { Event = "create", Transaction = model } });
    }
}
