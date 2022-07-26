using System.Reflection;
using Autofac;
using FinanceTrackerApi.DAL;
using Npgsql;

namespace FinanceTrackerApi.Infrastructure;

public class MainModule : Autofac.Module
{
    private IConfiguration Configuration { get; }

    public MainModule(IConfiguration configuration)
    {
        this.Configuration = configuration;
    }

    protected override void Load(ContainerBuilder builder)
    {
        builder.Register((_, _) => new NpgsqlConnection(this.Configuration.GetValue<string>("DatabaseConnectionString"))).InstancePerLifetimeScope();

        builder.RegisterType<Database>().InstancePerLifetimeScope();

        var serviceTypes = Assembly.GetExecutingAssembly()
            .DefinedTypes.Where(x => x.IsClass && x.Name.EndsWith("Service")).ToList();

        foreach (var serviceType in serviceTypes)
        {
            builder.RegisterType(serviceType).InstancePerLifetimeScope();
        }

        base.Load(builder);
    }
}