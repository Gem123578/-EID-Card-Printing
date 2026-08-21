using EIDCardPrint.Models.DTO.ReceivedCard;

namespace EIDCardPrint.Services
{
    public class ReceiveCardServices : IReceiveCardServices
    {
        public Task<ReceivedCardRes> ReceiveCardAsync(ReceivedCardReq qRcode, string token)
        {
            throw new NotImplementedException();
        }
    }
}
