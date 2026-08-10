namespace EIDCardPrint.Services
{
    public class DateRange : IDateRange
    {
        public async Task<(DateTime? FromDate, DateTime? ToDate)> GetDateRange(string dateRange,DateTime? customFromDate = null,DateTime? customToDate = null)
        {

            DateTime today = DateTime.Today;

            switch (dateRange)
            {
                case "last7":
                    return (today.AddDays(-6), today);

                case "thisMonth":
                    return (
                        new DateTime(today.Year, today.Month, 1),
                        today
                    );

                case "lastMonth":
                    var lastMonth = today.AddMonths(-1);

                    return (
                        new DateTime(lastMonth.Year, lastMonth.Month, 1),
                        new DateTime(today.Year, today.Month, 1).AddDays(-1)
                    );

                case "thisYear":
                    return (
                        new DateTime(today.Year, 1, 1),
                        today
                    );

                case "lastYear":
                    return (
                        new DateTime(today.Year - 1, 1, 1),
                        new DateTime(today.Year, 1, 1).AddDays(-1)
                    );

                case "custom":
                    return (customFromDate, customToDate);

                default:
                    return (null, null);
            }
        }

    }
}
