using EIDCardPrint.Models;
using Microsoft.AspNetCore.Mvc;

namespace EIDCardPrint.Controllers
{
    public class CardPrintController : Controller
    {
        [HttpGet]
        public IActionResult EIDCardPrint(string applicantId, string uid)
        {
            var model = new EIDCardPrintViewModel
            {
                ApplicantId = applicantId,
                UID = uid
            };
            return View(model);
        }
    }
}
