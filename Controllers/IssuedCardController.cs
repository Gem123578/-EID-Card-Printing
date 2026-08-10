using Microsoft.AspNetCore.Mvc;

namespace EIDCardPrint.Controllers
{
    public class IssuedCardController : Controller
    {
        public IActionResult IssuedCardForm()
        {
            return View();
        }

        public IActionResult ReceivedCard()
        {
            return View();
        }
    }
}
