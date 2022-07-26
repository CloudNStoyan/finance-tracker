using Autofac;
using Autofac.Extensions.DependencyInjection;
using FinanceTrackerApi.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(autofacBuilder =>
    autofacBuilder.RegisterModule(new MainModule(builder.Configuration)));

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllerRoute(
    "default",
    "/{controller}/{action}/{id?}");

app.Run();
