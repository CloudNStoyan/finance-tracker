using System.Transactions;

namespace FinanceTrackerApi.Infrastructure;

public static class TransactionBusinessLogic
{
    public static decimal GetOccurrencesBetweenDates(DateTime a, DateTime b, string repeatType, int repeatEvery, int? maxOccurrences)
    {
        int diff = 0;

        if (repeatType == "daily")
        {
            diff = DateUtils.DaysDifference(a, b);
        }
            
        if (repeatType == "weekly")
        {
            diff = DateUtils.WeeksDifference(a, b);
        }

        if (repeatType == "monthly")
        {
            diff = DateUtils.MonthsDifference(a, b);
        }

        if (repeatType == "yearly")
        {
            diff = DateUtils.YearsDifference(a, b);
        }

        decimal occurrences = Math.Floor((diff / (decimal)repeatEvery) + 1);

        if (maxOccurrences.HasValue)
        {
            occurrences = Math.Min(maxOccurrences.Value, occurrences);
        }

        return occurrences;
    }
}
