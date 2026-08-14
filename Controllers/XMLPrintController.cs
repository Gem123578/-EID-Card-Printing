using EIDCardPrint.Models;
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

        public XMLPrintController(IApplicantServices applicantService, EidXmlGenerator eidxml)
        {
            _applicantService = applicantService;
            _xmlGenerator = eidxml;
        }
        //for xml file export
        [HttpPost]
        public async Task<IActionResult> GenerateEidXml([FromBody] EidXmlRequest request)
        {
            try
            {
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
                if (request.CurrentPageNumber < 1)
                {
                    request.CurrentPageNumber = 1;
                }

                if (request.ApplicantPerPage < 1)
                {
                    request.ApplicantPerPage = 10;
                }

                if (request == null ||
                    string.IsNullOrWhiteSpace(request.ApplicationId))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "ApplicantId is required."
                    });
                }


                var applicant = await _applicantService.GetApplicant(applicantRequest,request.ApplicationId);


                if (applicant == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message =
                            $"Applicant not found: " +
                            $"{request.ApplicationId}"
                    });
                }


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
                    };


                var result = _xmlGenerator.Generate(viewModel);


                if (!result.Success)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = result.Message
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = result.Message,
                    fileName = result.FileName,
                    filePath = result.FilePath
                });
            }
            catch (Exception ex)
            {
                // IMPORTANT
                Console.WriteLine(
                    "GenerateEidXml ERROR:");

                Console.WriteLine(
                    ex.ToString()
                );

                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message,
                    detail = ex.ToString()
                });
            }
        }
    }
}
