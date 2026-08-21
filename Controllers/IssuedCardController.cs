    using EIDCardPrint.Models;
    using EIDCardPrint.Models.DTO.ChangeIssueStatus;
    using EIDCardPrint.Models.DTO.QRScan;
using EIDCardPrint.Models.DTO.ReceivedCard;
using EIDCardPrint.Services;
    using Microsoft.AspNetCore.Mvc;
    using System.Security.Cryptography.Xml;

    namespace EIDCardPrint.Controllers
    {
        public class IssuedCardController : Controller
        {
            private readonly IQRCodeServices _qrCodeServices;
            private readonly IAppointmentServices _appointment;
            private readonly IChangeIssueStatusServices _issueStatus;
            private readonly IReceiveCardServices _receiveCard;

            public IssuedCardController(IQRCodeServices qrCodeServices , IAppointmentServices appointment, IChangeIssueStatusServices issueStatus, IReceiveCardServices receiveCard)
            {
                _qrCodeServices = qrCodeServices;
                _appointment = appointment;
                _issueStatus = issueStatus;
                _receiveCard = receiveCard;
            }
            [HttpGet]
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

            [HttpPost]
            public async Task<IActionResult> IssuedCardForm(IssuedCardViewModel model)
            {
               
                var token = HttpContext.Session.GetString("ApiToken");

                bool isRepresentative = !string.IsNullOrWhiteSpace(model.RepPeople?.RName);

            var request = new IssueStausReq
            {
                ApplicantId = model.AppointNo,

                IssueDate = DateTime.Today,

                IssuePerson =new List<IssuePerson> {
                    new IssuePerson
                    {
                        Name = model.RepPeople.RName,

                        Phno = model.RepPeople.PhoneNo,

                        Person_type = isRepresentative ? "2" : "1",

                        NRC = model.RepPeople.RNRC,

                        Relative = model.RepPeople.Relationship
                    },
                    }
            };
                // Issue API call
                IssueStatusRes response = await _issueStatus.ChangeIssueStatusAsync(request , token);

                // result ကိုစစ်ပါ
                if (response.Status != "200")
                {
                    ModelState.AddModelError("", response.Message);
                    return View(request);
                }

            TempData["SuccessMessage"] = response.Message;
                return RedirectToAction(nameof(IssuedCardForm));
            }

        [HttpPost]
        public async Task<IActionResult> ScanReceiveQRCode(
            [FromBody] QRScanRequest qrRequest)
        {
            if (qrRequest == null ||
                string.IsNullOrWhiteSpace(qrRequest.QRcode))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "QR Code is required."
                });
            }

            string? token =
                HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrWhiteSpace(token))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "API Token မရှိပါ။"
                });
            }
            string encryptData = qrRequest.QRcode.Trim();

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
            string PackageCode = result[0];
            string Status = result[1];

            ReceivedCardReq request = new ReceivedCardReq
            {
                PackageCode = PackageCode,
                Status = Status,
            };

            ReceivedCardRes response =
                await _receiveCard.ReceiveCardAsync( request ,token);

            if (!response.Success)
            {
                return BadRequest(response);
            }

            return Ok(response);
        }
        }
    }
