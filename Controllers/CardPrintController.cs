using EIDCardPrint.Models;
using EIDCardPrint.Models.DTO;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.PrintedDto;
using EIDCardPrint.Models.EidCardXMl;
using EIDCardPrint.Services;
using EIDCardPrint.Utils;
using Microsoft.AspNetCore.Mvc;
using QRCoder;
using System.Reflection;
using static System.Net.Mime.MediaTypeNames;

namespace EIDCardPrint.Controllers
{
    public class CardPrintController : Controller
    {
        private readonly IApplicantServices _applicantService;

        public CardPrintController(IApplicantServices applicantService)
        {
            _applicantService = applicantService;
        }

        [HttpGet]
        public async Task<IActionResult>EIDCardPrint(EIDCardModel request, string? OfficeCode)
        {

            var token = HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrWhiteSpace(token))
            {
                return RedirectToAction("Login", "Home");
            }

            if (string.IsNullOrWhiteSpace(request.ApplicantId) &&
                string.IsNullOrWhiteSpace(request.Uid))
            {
                return BadRequest("ApplicantId or Uid is required.");
            }

            if (request.CurrentPageNumber < 1)
            {
                request.CurrentPageNumber = 1;
            }

            if (request.ApplicantPerPage < 1)
            {
                request.ApplicantPerPage = 10;
            }

            var applicantRequest = new ApplicantListRequest
            {
                CurrentPageNumber = request.CurrentPageNumber,
                ApplicantPerPage = request.ApplicantPerPage,
                SearchTerm = request.SearchTerm,
                OfficeCode = request.OfficeCode,
                FromDate = request.FromDate?.ToString("yyyy-MM-dd"),
                ToDate = request.ToDate?.ToString("yyyy-MM-dd")
            };

            var applicant = await _applicantService.GetApplicant(
                applicantRequest,
                request.ApplicantId
            );

            if (applicant == null)
            {
                return NotFound(
                    $"Applicant not found. " +
                    $"ApplicationId={request.ApplicantId}, " +
                    $"Uid={request.Uid}"
                );
            }

            var qrBase64 = GeneratedQrCode(
                applicant.Uid.ToString()
            );

            var viewModel = new EIDCardPrintViewModel
            {
                ApplicantId = applicant.ApplicationId,
                UID = applicant.Uid.ToString(),
                NRC = applicant.Nrc,
                Sex = applicant.Gender,
                DOB = applicant.BirthDate,
                MName = applicant.PersonNameMm,
                EName = applicant.PersonNameEn,
                Image = applicant.Photo,
                QR = qrBase64,

                // Grid state
                CurrentPageNumber = request.CurrentPageNumber,
                ApplicantPerPage = request.ApplicantPerPage,
                OfficeCode = request.OfficeCode,
                SearchTerm = request.SearchTerm,
                SelectedDate = request.SelectedDate,
                FromDate = request.FromDate,
                ToDate = request.ToDate
            };

            return View(viewModel);
        }

        private string GeneratedQrCode(string text)
        {
            using var qrGenerator = new QRCodeGenerator();

            using var qrData = qrGenerator.CreateQrCode(text,QRCodeGenerator.ECCLevel.M);

            var qrCode = new PngByteQRCode(qrData);

            var qrBytes = qrCode.GetGraphic(
                pixelsPerModule: 20,
                drawQuietZones: true
            );

            return Convert.ToBase64String(qrBytes);
        }

        

        [HttpPost]
        public async Task<IActionResult> MarkAsPrinted([FromBody]MarkPrintedRequest request)
        {
            try
            {
                var token =
                    HttpContext.Session.GetString("ApiToken");

                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized();
                }

                // API call
                var result = await _applicantService.MarkAsPrinted(request,token);

                return Ok(new
                {
                    success = true,
                    message = result.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
