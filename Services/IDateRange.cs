using EIDCardPrint.Models.DTO;

namespace EIDCardPrint.Services
{
    public interface IDateRange
    {
        Task<(DateTime? FromDate, DateTime? ToDate)> GetDateRange(string dateRange, DateTime? customFromDate = null, DateTime? customToDate = null);
    }
}
