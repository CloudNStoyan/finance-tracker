﻿using FinanceTrackerApi.Auth;
using FinanceTrackerApi.DAL;
using FinanceTrackerApi.Infrastructure;
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

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession || !inputDto.UserId.HasValue || inputDto.UserId != session.UserId)
        {
            return this.Unauthorized();
        }

        await this.TransactionService.Update(TransactionService.PocoFromDto(inputDto));

        return Ok(inputDto);
    }

    [HttpGet]
    public async Task<ActionResult<TransactionDTO>> Get([FromQuery] int? transactionId, [FromQuery] DateTime? transactionDate)
    {
        if (!transactionId.HasValue && !transactionDate.HasValue)
        {
            return this.BadRequest();
        }

        var transaction = transactionId.HasValue
            ? await this.TransactionService.GetById(transactionId.Value)
            : await this.TransactionService.GetByDate(DateOnly.FromDateTime(transactionDate!.Value));

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

    [HttpPost]
    public async Task<ActionResult<TransactionDTO>> Create([FromBody] TransactionDTO inputDto)
    {
        var validatorResult = CustomValidator.Validate(inputDto);

        if (!validatorResult.IsValid)
        {
            return new BadRequestResult();
        }

        inputDto.UserId = this.SessionService.Session.UserId;

        var model = await this.TransactionService.Create(inputDto);

        return CreatedAtAction(nameof(this.Create), model);
    }
}