using FinanceTrackerApi.DAL;

namespace FinanceTrackerApi.Auth;

public class MeDTO
{
    public string Email { get; set; }
    public bool Activated { get; set; }
}
