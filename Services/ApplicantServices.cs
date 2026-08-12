using EIDCardPrint.Common;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.PrintedDto;
using EIDCardPrint.Utils;
using log4net;
using System.Diagnostics;
using System.Net.Http.Headers;

namespace EIDCardPrint.Services
{
    public class ApplicantServices : IApplicantServices
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        private readonly IAPIAccessHelper _api;

        private readonly ILog _logger;

        public ApplicantServices(IHttpContextAccessor httpContextAccessor , IAPIAccessHelper api , ILogFactory logFactory)
        { 
            _httpContextAccessor = httpContextAccessor;
            _api = api;
            _logger = logFactory.CreateLogger<APIAccessHelper>();
        }

        public async Task<ApplicantDto?> GetApplicant(ApplicantListRequest request, string applicantId)
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

                var response = await _api.SendRequestAsync<ApplicantListRes>(requestDto);

                if (response == null)
                {
                    return null;
                }

                if (response.Data == null)
                {
                    return null;
                }

                var applicant = response.Data.FirstOrDefault(x =>x.ApplicationId == applicantId);

                return applicant;
            }
            catch (Exception ex)
            {
                _logger.Error("Error in GetApplicants: " + ex.Message);
                throw;
            }
            
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


                var response = await _api.SendRequestAsync<ApplicantListRes>(requestDto);

                if(!string.IsNullOrWhiteSpace(request.SearchTerm))
{
                    response.Data = response.Data
                        .Where(x =>
                            x.Uid.ToString().Contains(request.SearchTerm,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            (x.PersonNameMm ?? "").Contains(request.SearchTerm,
                                    StringComparison.OrdinalIgnoreCase)
                            ||
                            (x.ApplicationId.ToString().Contains(request.SearchTerm,
                            StringComparison.OrdinalIgnoreCase))).ToList();
                }

                return response;
            }
            catch (Exception ex)
            {
                _logger.Error("Error in GetApplicants: " + ex.Message);
                throw;
            }

        }

        public async Task<PrintedResponse> MarkAsPrinted(MarkPrintedRequest request, string token)
        {

            if (string.IsNullOrEmpty(token))
            {
                throw new Exception("Token is null or empty");
            }
            Debug.WriteLine($"HTTP Status: {request}");
            //Authorization bearer token
            RequestDto requestDto = ModelConverter.CreateRequestDto(
                request,
                APIAccessHelper.BaseUrl,
                "api/print-applicants",
                eHttpRequestType.POST
            );
            requestDto.AccessToken = token;
            PrintedResponse response = await _api.SendRequestAsync<PrintedResponse>(requestDto);
            return response;
        }
    }
}
