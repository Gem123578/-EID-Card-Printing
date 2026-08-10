using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Utils;
using log4net;
using System.Net.Http.Headers;

namespace EIDCardPrint.Services
{
    public class ApplicantServices : IApplicantServices
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly IAPIAccessHelper _api;

        private readonly ILog _logger;
        private ApplicantListRes response;

        public ApplicantServices(IHttpContextAccessor httpContextAccessor , IAPIAccessHelper api , ILogFactory logFactory)
        { 
            _httpContextAccessor = httpContextAccessor;
            _api = api;
            _logger = logFactory.CreateLogger<APIAccessHelper>();
        }

        public async Task<ApplicantListRes> GetApplicants(ApplicantListRequest request)
        {
            try
            {
                //get login token from session 
                var token = _httpContextAccessor.HttpContext.Session.GetString("ApiToken");

                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Token is null or empty");
                }

                //Authorization bearer token
                RequestDto requestDto = ModelConverter.CreateRequestDto(
                    request,
                    APIAccessHelper.BaseUrl,
                    "api/search-applicant-infos",
                    eHttpRequestType.POST
                );

                // Token added
                requestDto.AccessToken = token;


                return response = await _api.SendRequestAsync<ApplicantListRes>(requestDto);
            }
            catch (Exception ex)
            {
                _logger.Error("Error in GetApplicants: " + ex.Message);
                throw;
            }

        }
    }
}
