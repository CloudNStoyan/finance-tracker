using FinanceTrackerApi.DAL;
using FinanceTrackerApi.Auth;
using FinanceTrackerApi.Category;
using FinanceTrackerApi.Smtp;
using FinanceTrackerApi.Transaction;
using Npgsql;

namespace FinanceTrackerApi.Infrastructure;

public static class CustomServicesServiceCollectionExtensions
{
    // ReSharper disable once UnusedMethodReturnValue.Global
    public static IServiceCollection AddCustomServices(this IServiceCollection services)
    {
        if (services == null)
        {
            throw new ArgumentNullException(nameof(services));
        }

        services.AddScoped((provider =>
        {
            var config = provider.GetService<IConfiguration>();
            
            return new NpgsqlConnection(config.GetConnectionString("AppDb"));
        }));

        services.AddScoped<Database>();
        services.AddScoped<AuthenticationService>();
        services.AddScoped<SessionCookieService>();
        services.AddScoped<CookieService>();
        services.AddScoped<PasswordService>();
        services.AddScoped<ReCaptchaService>();
        services.AddScoped<SessionService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<MailService>();
        services.AddScoped<TransactionService>();

        return services;
    }
}
