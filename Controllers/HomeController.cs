using EIDCardPrint.Models;
using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.LoginDto;
using EIDCardPrint.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;
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
                    HttpContext.Session.SetString("Permission", JsonConvert.SerializeObject(response.User.Permissions));
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

        [HttpGet]
        public async Task<IActionResult> CardPrintingGrid(ApplicantListPageView dataModel)
        {
            var token = HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login");
            }
            if (dataModel.CurrentPageNumber < 1)
            {
                dataModel.CurrentPageNumber = 1;
            }
            if (dataModel.ApplicantPerPage < 1)
            {
                dataModel.ApplicantPerPage = 10;
            }

            var (fromDate, toDate) =
                await _dateRangeService.GetDateRange(
                    dataModel.SelectedDate,
                    dataModel.FromDate,
                    dataModel.ToDate
                );

            dataModel.FromDate = fromDate;
            dataModel.ToDate = toDate;

            var request = new ApplicantListRequest
            {
                CurrentPageNumber = dataModel.CurrentPageNumber,
                ApplicantPerPage = dataModel.ApplicantPerPage,

                // Search
                SearchTerm = dataModel.SearchTerm,

                // Office Code
                OfficeCode = dataModel.OfficeCode,

                // Date
                FromDate = dataModel.FromDate?
                    .ToString("yyyy-MM-dd"),

                ToDate = dataModel.ToDate?
                    .ToString("yyyy-MM-dd")
            };

            var result =
                await _applicantService.GetApplicants(request);

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

            var applicants = result.Data
                .Select(x => new ApplicantListView
                {
                    ApplicantId = x.ApplicationId.ToString(),
                    UId = x.Uid.ToString(),
                    NRC = x.Nrc,
                    Gender = x.Gender,
                    DOB = x.BirthDate,
                    PersonNameMM = x.PersonNameMm,
                    PersonNameEN = x.PersonNameEn,
                    PrintedDate = x.PrintedDate,
                    Photo = x.Photo
                })
                .ToList();

            var viewModel = new ApplicantListPageView
            {
                RecordCount = result.RecordCount,

                CurrentPageNumber = request.CurrentPageNumber,

                ApplicantPerPage = request.ApplicantPerPage,
                TotalPages = request.ApplicantPerPage > 0? (int)Math.Ceiling((double)result.RecordCount / request.ApplicantPerPage): 0,
                Applicants = applicants,

                SearchTerm = dataModel.SearchTerm,

                OfficeCode = dataModel.OfficeCode,

                OfficeName = dataModel.OfficeName,

                SelectedDate = dataModel.SelectedDate,

                FromDate = dataModel.FromDate,

                ToDate = dataModel.ToDate
            };

            return View(viewModel);
        }

        [HttpGet]
        public async Task<IActionResult> GetOffices()
        {
            var token = HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized();
            }

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
