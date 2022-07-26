using System.ComponentModel.DataAnnotations;

namespace FinanceTrackerApi.Infrastructure;

public static class CustomValidator
{
    public static ValidatorResult Validate<T>(T model)
    {
        if (model == null)
        {
            return new ValidatorResult
            {
                IsValid = false,
                Errors = new[] { "Model is null!" }
            };
        }

        var context = new ValidationContext(model, null, null);

        var results = new List<ValidationResult>();

        // ReSharper disable once ArgumentsStyleLiteral
        bool isValid = Validator.TryValidateObject(model, context, results, validateAllProperties: true);

        var result = new ValidatorResult
        {
            IsValid = isValid,
            Errors = results.Select(x => x.ErrorMessage).ToArray()
        };

        return result;
    }
}

public class ValidatorResult
{
    public bool IsValid { get; set; }
    public string?[] Errors { get; set; }
}