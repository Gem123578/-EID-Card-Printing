using EIDCardPrint.Models.DTO.QRScan;

namespace EIDCardPrint.Services
{
    public interface IAppointmentServices
    {
        Task<AppointmentRes> GetAppointment(AppointmentReq request , string token);
    }
}
