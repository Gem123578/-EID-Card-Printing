using EIDCardPrint.Models.DTO.QRScan;
using EIDCardPrint.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography.Xml;

namespace EIDCardPrint.Controllers
{
    public class IssuedCardController : Controller
    {
        private readonly IQRCodeServices _qrCodeServices;
        private readonly IAppointmentServices _appointment;

        public IssuedCardController(IQRCodeServices qrCodeServices , IAppointmentServices appointment)
        {
            _qrCodeServices = qrCodeServices;
            _appointment = appointment;
        }
        public IActionResult IssuedCardForm()
        {
            return View();
        }

        public IActionResult ReceivedCard()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ScanQRCode([FromBody]QRScanRequest request)
        {
            try
            {

                if(string.IsNullOrWhiteSpace(request.QRcode))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "QR Code is required."
                    });
                }

                var token = HttpContext.Session.GetString("ApiToken");

                string encryptData = request.QRcode.Trim();

                string decryptData = _qrCodeServices.DecryptQRCode(encryptData);

                if (string.IsNullOrWhiteSpace(decryptData))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "QR Code decryption failed."
                    });
                }

                string[] result = decryptData.Split('$');

                if (result.Length < 2)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid QR Code format."
                    });
                }

                string queue_token = result[0];
                string uid = result[1];

                //office
                string issueOffice = request.OfficeCode?.Trim()??"";

                if (string.IsNullOrWhiteSpace(issueOffice))
                {
                    return Ok(new
                    {
                        success = false,
                        
                        ApplicationId = queue_token,
                        uid = uid,
                        
                        message = "ရုံးအမည် တစ်ခုကိုရွေးချယ်ပါ"
                    });
                }

                AppointmentReq appointmentReq = new AppointmentReq
                {
                    AppointmentId = queue_token,
                    UID = uid,
                    Office = issueOffice
                };

                AppointmentRes appointment = await _appointment.GetAppointment(appointmentReq , token);
                if (appointment == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Appointment information not found."
                    });
                }
                Console.Write(appointment);
                return Ok(new
                {
                    success = true,

                    queueToken = queue_token,

                    uid = uid,

                    issueOffice = issueOffice,

                    appointment = appointment
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
