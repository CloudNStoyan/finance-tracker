﻿using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApi.Auth;

// ReSharper disable once ClassNeverInstantiated.Global
public class UserCredentialsDTO
{
    [Required]
    public string? Email { get; set; }

    [Required]
    public string? Password { get; set; }

    [Required]
    public string? ReCaptchaToken { get; set; }
}
