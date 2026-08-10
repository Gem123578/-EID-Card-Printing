namespace EIDCardPrint.Services
{
    public interface IOfficeServices
    {
        Task<List<OfficeDataRes>> GetOffices(string token);
    }
}
