using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class VerifyAccountDTO
{
    [Required]
    public string VerifyToken { get; set; }

    [Required]
    public string? ReCaptchaToken { get; set; }
}
