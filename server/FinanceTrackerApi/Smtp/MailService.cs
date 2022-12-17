using MailKit.Net.Smtp;
using MimeKit;

namespace FinanceTrackerApi.Smtp;

public class MailService
{
    private IConfiguration Configuration { get; }
    private SmtpConfig SmtpConfig { get; }
    private SmtpClient SmtpClient = new();

    public MailService(IConfiguration configuration)
    {
        this.Configuration = configuration;

        this.SmtpConfig = new SmtpConfig
        {
            Host = this.Configuration.GetValue<string>("SmtpHost"),
            Port = this.Configuration.GetValue<int>("SmtpPort"),
            Username = this.Configuration.GetValue<string>("SmtpUsername"),
            Password = this.Configuration.GetValue<string>("SmtpPassword")
        };
    }

    private async Task ConnectOrAuthenticateIfNeeded()
    {
        if (!this.SmtpClient.IsConnected)
        {
            await this.SmtpClient.ConnectAsync(this.SmtpConfig.Host, this.SmtpConfig.Port, false);
        }

        if (!this.SmtpClient.IsAuthenticated)
        {
            await this.SmtpClient.AuthenticateAsync(this.SmtpConfig.Username, this.SmtpConfig.Password);
        }
    }

    public async Task SendConfirmRegistrationEmail(string emailAddress, string token)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Finance Tracker", "no-reply@financetracker.xyz"));
        message.To.Add(new MailboxAddress("", emailAddress));
        message.Subject = "Welcome to Finance Tracker";

        message.Body = new TextPart("html")
        {
            Text = MailTemplate.Template.Replace("{{TOKEN}}", token)
        };

        await this.ConnectOrAuthenticateIfNeeded();

        try
        {
            await this.SmtpClient.SendAsync(message);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
        }
    }
}