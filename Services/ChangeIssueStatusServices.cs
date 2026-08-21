using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.ChangeIssueStatus;
using EIDCardPrint.Models.DTO.QRScan;
using EIDCardPrint.Utils;
using ZXing.Aztec.Internal;

namespace EIDCardPrint.Services
{
    public class ChangeIssueStatusServices : IChangeIssueStatusServices
    {
        public readonly IAPIAccessHelper _api;

        public ChangeIssueStatusServices(IAPIAccessHelper aPIAccessHelper)
        {
            _api = aPIAccessHelper;
        }

        public async Task<IssueStatusRes> ChangeIssueStatusAsync(IssueStausReq request , string token)
        {
            RequestDto requestDto = ModelConverter.CreateRequestDto(request, APIAccessHelper.BaseUrl, "api/change-issue-status-perso", eHttpRequestType.POST);

            requestDto.AccessToken = token;
            return await _api.SendRequestAsync<IssueStatusRes>(requestDto);
        }
    }
}
