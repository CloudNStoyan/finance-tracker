using Newtonsoft.Json;

namespace FinanceTrackerApi.Auth;

public class ReCaptchaService
{
    private string SecretKey { get; }
    private readonly HttpClient _httpClient = new();
    private const string BaseUrl = "https://www.google.com/recaptcha/api/siteverify";

    public ReCaptchaService(IConfiguration configuration)
    {
        string secretKey = configuration.GetValue<string>("ReCaptchaSecretKey");

        if (string.IsNullOrWhiteSpace(secretKey))
        {
            throw new Exception("Can't find ReCaptchaSiteKey in appsettings");
        }

        this.SecretKey = secretKey;
    }

    public async Task<bool> VerifyToken(string token)
    {
        var response = await _httpClient.PostAsync($"{BaseUrl}?secret={this.SecretKey}&response={token}", new StringContent(""));

        string json = await response.Content.ReadAsStringAsync();

        var result = JsonConvert.DeserializeObject<VerifyResponse>(json);

        if (result == null)
        {
            return false;
        }

        return (result.Success && result.Score >= 0.5m);
    }
}

public class VerifyResponse
{
    [JsonProperty("success")]
    public bool Success { get; set; }
    [JsonProperty("score")]
    public decimal Score { get; set; }
    [JsonProperty("action")]
    public string Action { get; set; }
    [JsonProperty("challenge_ts")]
    public DateTime ChallengeTimeStamp { get; set; }
    [JsonProperty("hostname")]
    public string Hostname { get; set; }
}