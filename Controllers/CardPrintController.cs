using EIDCardPrint.Models;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.PrintedDto;
using EIDCardPrint.Services;
using Microsoft.AspNetCore.Mvc;
using QRCoder;

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
        public async Task<IActionResult>EIDCardPrint(string applicantId, string uid , string? OfficeCode)
        {

            var token = HttpContext.Session.GetString("ApiToken");

            //api request   
            var request = new ApplicantListRequest { CurrentPageNumber = 1, ApplicantPerPage = 10, OfficeCode = OfficeCode };
            var applicant = await _applicantService.GetApplicant(request, applicantId, uid);
            string qrText = applicant.Uid.ToString();

            using var qrGenerator = new QRCodeGenerator();

            using var qrData = qrGenerator.CreateQrCode(
                qrText,
                QRCodeGenerator.ECCLevel.M);

            var qrCode = new PngByteQRCode(qrData);

            // 20px module size
            byte[] qrBytes = qrCode.GetGraphic(
                pixelsPerModule: 20,
                drawQuietZones: true);

            string qrBase64 = Convert.ToBase64String(qrBytes);
            var model = new EIDCardPrintViewModel
            {
                ApplicantId = applicant.ApplicationId,
                UID = applicant.Uid.ToString(),
                NRC = applicant.Nrc,
                Sex = applicant.Gender,
                DOB = applicant.BirthDate,
                MName = applicant.PersonNameMm,
                EName = applicant.PersonNameEn,
                Image = applicant.Photo,
                QR = qrBase64
            };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> MarkAsPrinted([FromBody]MarkPrintedRequest model)
        {
            try
            {
                var token =
                    HttpContext.Session.GetString("ApiToken");

                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized();
                }

                // API ကို call
                var result = await _applicantService.MarkAsPrinted(
                        model.ApplicantId,
                        token);

                if (result.ResponseStatus != "success")
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Unable to update printed status"
                    });
                }

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
