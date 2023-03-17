using System.Transactions;

namespace FinanceTrackerApi.Infrastructure;

public static class TransactionBusinessLogic
{
    public static decimal GetOccurrencesBetweenDates(DateTime date, DateTime transactionDate, string repeatType, int repeatEvery, int? maxOccurrences)
    {
        int diff = 0;

        if (repeatType == "daily")
        {
            diff = DateUtils.DaysDifference(date, transactionDate);
        }
            
        if (repeatType == "weekly")
        {
            diff = DateUtils.WeeksDifference(date, transactionDate);
        }

        if (repeatType == "monthly")
        {
            diff = DateUtils.MonthsDifference(date, transactionDate);
        }

        if (repeatType == "yearly")
        {
            diff = DateUtils.YearsDifference(date, transactionDate);
        }

        decimal occurrences = Math.Floor((diff / (decimal)repeatEvery) + 1);

        if (maxOccurrences.HasValue)
        {
            occurrences = Math.Min(maxOccurrences.Value, occurrences);
        }

        return occurrences;
    }

    public static DateTime GetNextOccurrenceDate(string repeatMode, DateTime transactionDate, int repeatEvery)
    {
        return repeatMode switch
        {
            "daily" => transactionDate.AddDays(1 * repeatEvery),
            "weekly" => transactionDate.AddDays(7 * repeatEvery),
            "monthly" => transactionDate.AddMonths(1 * repeatEvery),
            "yearly" => transactionDate.AddYears(1 * repeatEvery ),
            _ => throw new Exception("Repeat was not a valid value")
        };
    }

    public static DateTime GetPreviousOccurrenceDate(string repeatMode, DateTime transactionDate, int repeatEvery)
    {
        return repeatMode switch
        {
            "daily" => transactionDate.AddDays(-1 * repeatEvery),
            "weekly" => transactionDate.AddDays(-7 * repeatEvery),
            "monthly" => transactionDate.AddMonths(-1 * repeatEvery),
            "yearly" => transactionDate.AddYears(-1 * repeatEvery),
            _ => throw new Exception("Repeat was not a valid value")
        };
    }

}
