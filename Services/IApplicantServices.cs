using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.PrintedDto;

namespace EIDCardPrint.Services
{
    public interface IApplicantServices
    {
        Task<ApplicantDto?> GetApplicant(ApplicantListRequest request, string applicantId);
        Task<ApplicantListRes> GetApplicants(ApplicantListRequest request);
        Task<PrintedResponse> MarkAsPrinted(MarkPrintedRequest request, string token);
    }
}
