namespace FinanceTrackerApi.Infrastructure;

public static class DateUtils
{
    public static int WeeksDifference(DateTime firstDate, DateTime secondDate) =>
        Convert.ToInt32(Math.Floor((firstDate - secondDate).TotalDays / 7));

    public static int MonthsDifference(DateTime firstDate, DateTime secondDate) =>
        Math.Abs((firstDate.Month - secondDate.Month) + ((firstDate.Year - secondDate.Year) * 12)) -
        (firstDate.Day >= secondDate.Day ? 0 : 1);

    public static int YearsDifference(DateTime firstDate, DateTime secondDate) =>
        Convert.ToInt32(Math.Floor((Math.Abs((firstDate.Month - secondDate.Month) + ((firstDate.Year - secondDate.Year) * 12)) -
                                    (firstDate.Day >= secondDate.Day ? 0 : 1)) / 12d));
}