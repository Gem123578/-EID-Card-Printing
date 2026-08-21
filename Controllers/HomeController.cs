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
                    HttpContext.Session.SetString("OfficeCode",response.User.OfficeCode ?? string.Empty);
                    return RedirectToAction("Personalization", "Home");
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
        public async Task<IActionResult> Personalization(ApplicantListPageView dataModel,bool isSearch = false)
        {
            Console.WriteLine(dataModel);
            var token = HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login");
            }

            //current user office

            var currentOfficeCode = HttpContext.Session.GetString("OfficeCode")?
                    .Trim()
                    .ToUpper();


            

            if (currentOfficeCode == "HO")
            {
                if (!isSearch)
                {
                    if (!isSearch)
                    {
                        // HO initial load
                        // Today နဲ့ API ခေါ်မယ်
                        dataModel.SelectedDate = "today";
                        dataModel.FromDate = DateTime.Today;
                        dataModel.ToDate = DateTime.Today;
                    }

                }
            }


            if (currentOfficeCode != "HO")
            {
                isSearch = true;

                // IMPORTANT
                // User ရဲ့ OfficeCode ကိုပဲ သုံးမယ်
                dataModel.OfficeCode = currentOfficeCode;
            }
            else
            {
                // HO user
                dataModel.OfficeCode = dataModel.OfficeCode;
            }

            // ============================================================
            // DATE RANGE
            // ============================================================

            var (fromDate, toDate) =
                await _dateRangeService.GetDateRange(
                    dataModel.SelectedDate,
                    dataModel.FromDate,
                    dataModel.ToDate
                );

            dataModel.FromDate = fromDate;
            dataModel.ToDate = toDate;

            // ============================================================
            // API REQUEST
            // ============================================================

            var request = new ApplicantListRequest
            {
                //CurrentPageNumber =
                //    dataModel.CurrentPageNumber,

                //ApplicantPerPage =
                //    dataModel.ApplicantPerPage,

                IsPrinted =
                    dataModel.IsPrinted == true
                        ? 1
                        : 0,

                SearchTerm =
                    dataModel.SearchTerm,

                OfficeCode =
                    currentOfficeCode == "HO"
                        ? dataModel.OfficeCode
                        : currentOfficeCode,

                FromDate =
                    dataModel.FromDate?
                        .ToString("yyyy-MM-dd"),

                ToDate =
                    dataModel.ToDate?
                        .ToString("yyyy-MM-dd")
            };

            // ============================================================
            // CALL API
            // ============================================================

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

            // ============================================================
            // MAP DATA
            // ============================================================

            var applicants =
                result.Data
                    .Select(x => new ApplicantListView
                    {
                        ApplicantId =
                            x.ApplicationId.ToString(),

                        UId =
                            x.Uid.ToString(),

                        NRC =
                            x.Nrc,

                        Gender =
                            x.Gender,

                        DOB =
                            x.BirthDate,

                        DOE =
                            x.DOE,

                        PersonNameMM =
                            x.PersonNameMm,

                        PersonNameEN =
                            x.PersonNameEn,

                        PrintedDate =
                            x.PrintedDate,

                        Photo =
                            x.Photo
                    })
                    .ToList();

            // ============================================================
            // VIEW MODEL
            // ============================================================

            var viewModel =
                new ApplicantListPageView
                {
                    RecordCount =
                        result.RecordCount,

                    //CurrentPageNumber = request.CurrentPageNumber ?? 1,

                    //ApplicantPerPage = request.ApplicantPerPage ?? result.RecordCount,

                    //TotalPages = 1,

                    Applicants =
                        applicants,

                    IsSearch =
                        true,

                    IsPrinted =
                        dataModel.IsPrinted,

                    SearchTerm =
                        dataModel.SearchTerm,

                    OfficeCode =
                        request.OfficeCode,

                    OfficeName =
                        dataModel.OfficeName,

                    SelectedDate =
                        dataModel.SelectedDate,

                    FromDate =
                        dataModel.FromDate,

                    ToDate =
                        dataModel.ToDate
                };

            ModelState.Clear();

            return View(viewModel);
        }


        [HttpGet]
        public async Task<IActionResult>PrintedCards(ApplicantListPageView dataModel,bool isSearch = false)
        {
            // ============================================================
            // CHECK LOGIN
            // ============================================================

            var token =
                HttpContext.Session.GetString("ApiToken");

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login");
            }


            // ============================================================
            // CURRENT USER OFFICE
            // ============================================================

            var currentOfficeCode =
                HttpContext.Session.GetString("OfficeCode")?
                    .Trim()
                    .ToUpper();



            if (currentOfficeCode == "HO")
            {
                if (!isSearch)
                {
                    dataModel.SelectedDate = "today";

                    dataModel.FromDate =
                        DateTime.Today;

                    dataModel.ToDate =
                        DateTime.Today;

                    dataModel.IsPrinted = true;
                }
                }
            else
            {

                isSearch = true;

                dataModel.OfficeCode = currentOfficeCode;
            }


            var (fromDate, toDate) =
                await _dateRangeService.GetDateRange(
                    dataModel.SelectedDate,
                    dataModel.FromDate,
                    dataModel.ToDate
                );

            dataModel.FromDate = fromDate;
            dataModel.ToDate = toDate;


            var request =
                new ApplicantListRequest
                {
                    //CurrentPageNumber =
                    //    dataModel.CurrentPageNumber,

                    //ApplicantPerPage =
                    //    dataModel.ApplicantPerPage,

                    IsPrinted = 1,

                    SearchTerm =
                        dataModel.SearchTerm,


                    OfficeCode =
                        currentOfficeCode == "HO"
                            ? dataModel.OfficeCode
                            : currentOfficeCode,

                    FromDate =
                        dataModel.FromDate?
                            .ToString("yyyy-MM-dd"),

                    ToDate =
                        dataModel.ToDate?
                            .ToString("yyyy-MM-dd")
                };

            var result =
                await _applicantService.GetApplicants(request);



            if (result == null)
            {
                throw new Exception(
                    "API result is NULL"
                );
            }

            if (result.Data == null)
            {
                throw new Exception(
                    $"API Data is NULL. RecordCount = {result.RecordCount}"
                );
            }


            var applicants =
                result.Data
                    .Select(x => new ApplicantListView
                    {
                        ApplicantId =
                            x.ApplicationId.ToString(),

                        UId =
                            x.Uid.ToString(),

                        NRC =
                            x.Nrc,

                        Gender =
                            x.Gender,

                        DOB =
                            x.BirthDate,

                        DOE =
                            x.DOE,

                        PersonNameMM =
                            x.PersonNameMm,

                        PersonNameEN =
                            x.PersonNameEn,

                        PrintedDate =
                            x.PrintedDate,

                        Photo =
                            x.Photo
                    })
                    .ToList();


            // ============================================================
            // VIEW MODEL
            // ============================================================

            var viewModel =
                new ApplicantListPageView
                {
                    RecordCount =
                        result.RecordCount,

                    //CurrentPageNumber = request.CurrentPageNumber ?? 1,

                    //ApplicantPerPage = request.ApplicantPerPage ?? result.RecordCount,

                    //TotalPages = 1,

                    Applicants =
                        applicants,

                    IsSearch = true,

                    // IMPORTANT
                    // CardPrinted page => always true
                    IsPrinted = true,

                    SearchTerm =
                        dataModel.SearchTerm,

                    OfficeCode =
                        request.OfficeCode,

                    OfficeName =
                        dataModel.OfficeName,

                    SelectedDate =
                        dataModel.SelectedDate,

                    FromDate =
                        dataModel.FromDate,

                    ToDate =
                        dataModel.ToDate
                };


            ModelState.Clear();

            return View(viewModel);
        }

        [HttpGet]
        public IActionResult GetCurrentOfficer()
        {
            var officeCode =
                HttpContext.Session.GetString("OfficeCode");

            return Json(new
            {
                office_code = officeCode
            });
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
