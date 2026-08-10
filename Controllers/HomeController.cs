using EIDCardPrint.Models;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.LoginDto;
using EIDCardPrint.Services;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace EIDCardPrint.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILoginUserServices _service;
        private readonly IDateRange _dateRangeService;
        private readonly IApplicantServices _applicantService;
        private readonly IOfficeServices _officeService;

        public HomeController(ILoginUserServices service , IDateRange dateRangeService, IApplicantServices applicantService, IOfficeServices officeService)
        {
            _service = service;
            _dateRangeService = dateRangeService;
            _applicantService = applicantService;
            _officeService = officeService;
        }
        public IActionResult Login()
        {
             return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            try
            {
                var request = new LoginReqDto
                {
                    Name = model.Name,
                    Password = model.Password
                };

                var response = await _service.LoginUser(request);

                if (response.Success)
                {
                    HttpContext.Session.SetString("ApiToken", response.Token ?? string.Empty);
                    return RedirectToAction("CardPrintingGrid", "Home");
                }

                ModelState.AddModelError("", "Error: " + response.ResponseStatus);
                return View(new LoginViewModel());
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "Error: " + ex.Message);
                return View(new LoginViewModel());
            }
            
        }

        public async Task<IActionResult> CardPrintingGrid(ApplicantListView dataModel)
        {
            var token = HttpContext.Session.GetString("ApiToken");
            if (string.IsNullOrEmpty(token)) { return RedirectToAction("Login"); }


            var (fromDate, toDate) = await _dateRangeService.GetDateRange(dataModel.DateRange, dataModel.FromDate, dataModel.ToDate);
            dataModel.FromDate = fromDate;
            dataModel.ToDate = toDate;

            //api request   
            var request = new ApplicantListRequest { CurrentPageNumber = 1, ApplicantPerPage = 10, OfficeCode = "KMX" };


            //api call
            var result = await _applicantService.GetApplicants(request);
            if (result == null)
            {
                throw new Exception("API result is NULL");
            }

            if (result.Data == null)
            {
                throw new Exception(
                    $"API Data is NULL. RecordCount = {result.RecordCount}"
                );
            }

            //API result -> View Model
            var applicants = result.Data .Select(x => new ApplicantListView 
            {
                UId = x.Uid.ToString(),
                NRC = x.Nrc,
                Gender = x.Gender,
                DOB = x.BirthDate,
                PersonNameMM = x.PersonNameMm,
                PersonNameEN = x.PersonNameEn,
                PrintedDate = x.PrintedDate,
                Photo = x.Photo 
            }) .ToList();

            // View
            var viewModel = new ApplicantListPageView
            {
                RecordCount = result.RecordCount,
                CurrentPageNumber = request.CurrentPageNumber,
                ApplicantPerPage = request.ApplicantPerPage,
                OfficeCode = request.OfficeCode,
                Applicants = applicants 
            };
            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetOfficesAsync()
        {
            var token = HttpContext.Session.GetString("ApiToken");
            if (string.IsNullOrEmpty(token)) { return RedirectToAction("Login"); }

            // Office API ကို token နဲ့ ခေါ်မယ့် service
            var result = await _officeService.GetOffices(token);

            return Json(result);
        }

        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("ApiToken");
            return RedirectToAction("Login", "Home");
        }
    }
}
