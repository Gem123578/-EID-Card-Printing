using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.LoginDto;
using EIDCardPrint.Utils;

namespace EIDCardPrint.Services
{
    public class LoginUserServices : ILoginUserServices
    {
        private readonly IAPIAccessHelper _api;

        public LoginUserServices(IAPIAccessHelper api)
        {
            _api = api ;
        }
        public Task<LoginResDto> LoginUser(LoginReqDto request)
        {
            RequestDto requestDto = ModelConverter.CreateRequestDto(request, APIAccessHelper.BaseUrl, "api/authenticate-perso", eHttpRequestType.POST);
            return _api.SendRequestAsync<LoginResDto>(requestDto); 
        }
    }
}
