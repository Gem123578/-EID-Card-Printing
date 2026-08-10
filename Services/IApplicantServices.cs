using EIDCardPrint.Models.DTO.Applicants;

namespace EIDCardPrint.Services
{
    public interface IApplicantServices
    {
        Task<ApplicantListRes> GetApplicants(ApplicantListRequest request);
    }
}
