using FinanceTrackerApi.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace FinanceTrackerApi.Auth;

[ApiController]
[Route("[controller]")]
public class AuthController : ControllerBase
{
    private AuthenticationService AuthenticationService { get; }
    private ReCaptchaService ReCaptchaService { get; }
    private SessionService SessionService { get; }

    public AuthController(AuthenticationService authenticationService, ReCaptchaService reCaptchaService, SessionService sessionService)
    {
        this.AuthenticationService = authenticationService;
        this.ReCaptchaService = reCaptchaService;
        this.SessionService = sessionService;
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

        return this.Ok(new MeDTO { Username = user.Username });
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

        bool usernameIsFree = await this.AuthenticationService.IsUsernameFree(credentials.Username!);

        if (!usernameIsFree)
        {
            return this.BadRequest(new { status = 400, error = "Username is taken!" });
        }

        await this.AuthenticationService.Register(credentials);

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
            return this.BadRequest(new { status = 400, error = "Captcha Failed" });
        }

        string? sessionKey = await this.AuthenticationService.Login(credentials);

        if (sessionKey == null)
        {
            return this.Unauthorized();
        }

        return this.Ok(new {status = 200, sessionKey});
    }

    [HttpPost("/auth/logout")]
    public async Task<ActionResult> Logout()
    {
        await this.AuthenticationService.Logout(this.SessionService.Session.SessionId);

        return this.Ok();
    }
}
