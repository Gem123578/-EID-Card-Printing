using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.LoginDto;

namespace EIDCardPrint.Services
{
    public interface ILoginUserServices
    {
        Task<LoginResDto> LoginUser(LoginReqDto request);
    }
}
