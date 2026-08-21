
using EIDCardPrint.Models.DTO.ReceivedCard;

namespace EIDCardPrint.Services
{
    public interface IReceiveCardServices
    {
        Task<ReceivedCardRes> ReceiveCardAsync(ReceivedCardReq qRcode, string token);
    }
}
