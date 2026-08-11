using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.PrintedDto;

namespace EIDCardPrint.Services
{
    public interface IApplicantServices
    {
        Task<ApplicantDto?> GetApplicant(ApplicantListRequest request, string applicantId, string uid);
        Task<ApplicantListRes> GetApplicants(ApplicantListRequest request);
        Task<PrintedResponse> MarkAsPrinted(string applicantId, string token);
    }
}
