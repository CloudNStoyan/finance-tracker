using Autofac;
using Autofac.Extensions.DependencyInjection;
using FinanceTrackerApi.Auth;
using FinanceTrackerApi.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddCors(p => p.AddPolicy("corsapp", builder =>
{
    builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
}));

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(autofacBuilder =>
    autofacBuilder.RegisterModule(new MainModule(builder.Configuration)));

var app = builder.Build();

app.UseCors("corsapp");

app.UseAuthorization();

app.UseAuthMiddleware();

app.MapControllerRoute(
    "default",
    "/{controller}/{action}/{id?}");

app.Run();
