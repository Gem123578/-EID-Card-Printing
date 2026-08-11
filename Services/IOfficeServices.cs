using EIDCardPrint.Models.DTO.Offices;

namespace EIDCardPrint.Services
{
    public interface IOfficeServices
    {
        Task<List<OfficeStationData>> GetOffices(string token);
    }
}
