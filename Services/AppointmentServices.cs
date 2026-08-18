using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.LoginDto;
using EIDCardPrint.Models.DTO.QRScan;
using EIDCardPrint.Utils;

namespace EIDCardPrint.Services
{
    public class AppointmentServices : IAppointmentServices
    {
        private readonly IAPIAccessHelper _api;

        public AppointmentServices(IAPIAccessHelper accesshelper)
        {
            _api = accesshelper;
        }

        public async Task<AppointmentRes> GetAppointment(AppointmentReq request , string token)
        {
            
            RequestDto requestDto = ModelConverter.CreateRequestDto(request, APIAccessHelper.BaseUrl, "api/get-appointment-info", eHttpRequestType.POST);

            requestDto.AccessToken = token;
            return await _api.SendRequestAsync<AppointmentRes>(requestDto);
        }
    }
}
