using EIDCardPrint.Models.DTO.ChangeIssueStatus;

namespace EIDCardPrint.Services
{
    public interface IChangeIssueStatusServices
    {
        Task<IssueStatusRes> ChangeIssueStatusAsync(IssueStausReq request , string token);
    }
}
