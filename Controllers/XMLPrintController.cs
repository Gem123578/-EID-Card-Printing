using EIDCardPrint.Models;
using EIDCardPrint.Models.DTO;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.EidCardXMl;
using EIDCardPrint.Services;
using EIDCardPrint.Utils;
using Microsoft.AspNetCore.Mvc;

namespace EIDCardPrint.Controllers
{
    public class XMLPrintController : Controller
    {
        private readonly IApplicantServices _applicantService;
        private readonly EidXmlGenerator _xmlGenerator;

        public XMLPrintController(
            IApplicantServices applicantService,
            EidXmlGenerator eidxml)
        {
            _applicantService = applicantService;
            _xmlGenerator = eidxml;
        }

        [HttpPost]
        public async Task<IActionResult> GenerateEidXml(
            [FromBody] EIDCardModel? request)
        {
            try
            {
                // SESSION TOKEN

                var token =
                    HttpContext.Session.GetString("ApiToken");

                if (string.IsNullOrWhiteSpace(token))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Session expired."
                    });
                }

                // NULL REQUEST

                if (request == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Request data is required."
                    });
                }
                // APPLICANT ID

                if (string.IsNullOrWhiteSpace(
                    request.ApplicantId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "ApplicantId is required."
                    });
                }

                // APPLICANT REQUEST

                var applicantRequest =
                    new ApplicantListRequest
                    {
                        //CurrentPageNumber =
                        //    request.CurrentPageNumber,

                        //ApplicantPerPage =
                        //    request.ApplicantPerPage,

                        SearchTerm =
                            request.SearchTerm,

                        OfficeCode =
                            request.OfficeCode,

                        FromDate =
                            request.FromDate?
                                .ToString("yyyy-MM-dd"),

                        ToDate =
                            request.ToDate?
                                .ToString("yyyy-MM-dd"),

                        IsPrinted = request.IsPrinted
                    };

                // GET APPLICANT

                var applicant =
                    await _applicantService.GetApplicant(
                        applicantRequest,
                        request.ApplicantId
                    );

                if (applicant == null)
                {
                    return NotFound(new
                    {
                        success = false,

                        message =
                            $"Applicant not found: " +
                            $"{request.ApplicantId}"
                    });
                }

                // VIEW MODEL

                var viewModel =
                    new EIDCardPrintViewModel
                    {
                        ApplicantId =
                            applicant.ApplicationId,

                        UID =
                            applicant.Uid.ToString(),

                        NRC =
                            applicant.Nrc,

                        Sex =
                            applicant.Gender,

                        DOB =
                            applicant.BirthDate,

                        MName =
                            applicant.PersonNameMm,

                        EName =
                            applicant.PersonNameEn,

                        Image =
                            applicant.Photo,

                        DOE = applicant.DOE
                    };

                // GENERATE XML

                var result =
                    _xmlGenerator.Generate(
                        viewModel
                    );

                if (result == null)
                {
                    return StatusCode(
                        500,
                        new
                        {
                            success = false,
                            message =
                                "XML Generator returned null."
                        }
                    );
                }

                if (!result.Success)
                {
                    return BadRequest(new
                    {
                        success = false,

                        message =
                            result.Message ??
                            "XML generation failed."
                    });
                }

                if (result.FileBytes == null ||
                    result.FileBytes.Length == 0)
                {
                    return StatusCode(
                        500,
                        new
                        {
                            success = false,
                            message =
                                "XML file content is empty."
                        }
                    );
                }

                // FILE NAME

                var fileName =
                    !string.IsNullOrWhiteSpace(
                        result.FileName)

                        ? result.FileName

                        : $"{request.ApplicantId}.xml";

                // RETURN XML FILE

                return File(
                    result.FileBytes,
                    "application/xml",
                    fileName
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    new
                    {
                        success = false,

                        message =
                            ex.Message,

                        detail =
                            ex.ToString()
                    }
                );
            }
        }
    }
}
