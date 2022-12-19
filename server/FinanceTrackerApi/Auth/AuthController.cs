using FinanceTrackerApi.Infrastructure;
using FinanceTrackerApi.Smtp;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace FinanceTrackerApi.Auth;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private AuthenticationService AuthenticationService { get; }
    private ReCaptchaService ReCaptchaService { get; }
    private SessionService SessionService { get; }
    private MailService MailService { get; }

    public AuthController(AuthenticationService authenticationService, ReCaptchaService reCaptchaService,
        SessionService sessionService, MailService mailService)
    {
        this.AuthenticationService = authenticationService;
        this.ReCaptchaService = reCaptchaService;
        this.SessionService = sessionService;
        this.MailService = mailService;
    }

    [HttpGet("/auth/me")]

    public async Task<ActionResult> Me()
    {
        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.NotFound();
        }

        var user = await this.AuthenticationService.GetUserById(session.UserId!.Value);

        return this.Ok(new MeDTO { Email = user.Email, Activated = user.Activated });
    }

    [HttpPost("/auth/register")]
    public async Task<ActionResult> Register([FromBody] UserCredentialsDTO credentials)
    {
        var validatorResult = CustomValidator.Validate(credentials);

        if (!validatorResult.IsValid)
        {
            return this.BadRequest();
        }

        bool captchaIsValid = await this.ReCaptchaService.VerifyToken(credentials.ReCaptchaToken!);

        if (!captchaIsValid)
        {
            return this.BadRequest(new { status = 400, error = "Captcha Failed" });
        }

        bool emailFree = await this.AuthenticationService.IsEmailFree(credentials.Email!);

        if (!emailFree)
        {
            return this.BadRequest(new { status = 400, error = "Email is already registered!" });
        }

        string verifyToken = await this.AuthenticationService.Register(credentials);

        await this.MailService.SendConfirmRegistrationEmail(credentials.Email!.ToLower(), verifyToken);

        return this.Ok();
    }

    [HttpPost("/auth/verify-email")]
    public async Task<ActionResult> VerifyEmail([FromBody]VerifyAccountDTO verifyAccount)
    {
        var validatorResult = CustomValidator.Validate(verifyAccount);

        if (!validatorResult.IsValid)
        {
            return this.BadRequest();
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.BadRequest();
        }

        var userPoco = await this.AuthenticationService.GetUserById(session.UserId!.Value);

        if (userPoco!.Activated)
        {
            return this.BadRequest();
        }

        bool captchaIsValid = await this.ReCaptchaService.VerifyToken(verifyAccount.ReCaptchaToken!);

        if (!captchaIsValid)
        {
            return this.BadRequest(new { status = 400, error = "CaptchaFailed" });
        }

        var verifyUserPoco = await this.AuthenticationService.GetVerifyUserByToken(verifyAccount.VerifyToken);

        var now = DateTime.Now;

        if (verifyUserPoco == null || verifyUserPoco.Consumed || verifyUserPoco.ExpirationDate <= now)
        {
            return this.BadRequest(new {status = 400, error = "ExpiredToken"});
        }

        await this.AuthenticationService.ActivateAccount(verifyUserPoco.UserId, verifyAccount.VerifyToken);

        return this.Ok();
    }

    [HttpPost("/auth/resend-email")]
    public async Task<ActionResult> ResendEmail([FromBody] ResendEmailDTO resendEmail)
    {
        var validatorResult = CustomValidator.Validate(resendEmail);

        if (!validatorResult.IsValid)
        {
            return this.BadRequest();
        }

        bool captchaIsValid = await this.ReCaptchaService.VerifyToken(resendEmail.RecaptchaToken!);

        if (!captchaIsValid)
        {
            return this.BadRequest(new { status = 400, error = "CaptchaFailed" });
        }

        var session = this.SessionService.Session;

        bool isValidSession = session.IsLoggedIn && session.UserId.HasValue;

        if (!isValidSession)
        {
            return this.BadRequest();
        }

        var user = await this.AuthenticationService.GetUserById(session.UserId!.Value);

        string verifyToken = await this.AuthenticationService.CreateVerifyToken(user.UserId);

        await this.MailService.SendConfirmRegistrationEmail(user.Email!.ToLower(), verifyToken);

        return this.Ok();
    }

    [HttpPost("/auth/login")]
    public async Task<ActionResult> Login([FromBody] UserCredentialsDTO credentials)
    {
        var validatorResult = CustomValidator.Validate(credentials);

        if (!validatorResult.IsValid)
        {
            return this.BadRequest();
        }

        bool captchaIsValid = await this.ReCaptchaService.VerifyToken(credentials.ReCaptchaToken!);

        if (!captchaIsValid)
        {
            return this.BadRequest(new { status = 400, error = "CaptchaFailed" });
        }

        var loginAttempt = await this.AuthenticationService.Login(credentials);

        if (!loginAttempt.Success)
        {
            return this.Unauthorized(new { status = 400, error = loginAttempt.Error.ToString() });
        }

        return this.Ok(new {user = new MeDTO { Activated = loginAttempt.User!.Activated, Email = loginAttempt.User.Email }, sessionKey = loginAttempt.SessionKey});
    }

    [HttpPost("/auth/logout")]
    public async Task<ActionResult> Logout()
    {
        await this.AuthenticationService.Logout(this.SessionService.Session.SessionId);

        return this.Ok();
    }
}
