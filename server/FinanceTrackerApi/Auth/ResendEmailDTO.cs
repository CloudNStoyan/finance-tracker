using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApi.Auth;

public class ResendEmailDTO
{
    [Required]
    public string RecaptchaToken { get; set; }
}
