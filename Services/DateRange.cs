namespace EIDCardPrint.Services
{
    public class DateRange : IDateRange
    {
        public Task<(DateTime? FromDate, DateTime? ToDate)> GetDateRange(
            string? dateRange,
            DateTime? customFromDate,
            DateTime? customToDate)
        {
            DateTime today = DateTime.Today;

            switch (dateRange?.ToLower())
            {
                case "today":
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (today, today)
                    );

                case "last7":
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (today.AddDays(-6), today)
                    );

                case "thisMonth":
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (
                            new DateTime(today.Year, today.Month, 1),
                            today
                        )
                    );

                case "lastYear":
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (
                            new DateTime(today.Year - 1, 1, 1),
                            new DateTime(today.Year, 1, 1).AddDays(-1)
                        )
                    );

                case "custom":
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (customFromDate, customToDate)
                    );

                default:
                    return Task.FromResult<(DateTime?, DateTime?)>(
                        (null, null)
                    );
            }
        }
    }
}
