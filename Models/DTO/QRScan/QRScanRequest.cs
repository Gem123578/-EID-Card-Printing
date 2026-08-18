using Microsoft.Extensions.Primitives;

namespace EIDCardPrint.Models.DTO.QRScan
{
    public class QRScanRequest
    {
        public string   QRcode { get; set; }

        public string OfficeCode { get; set; }
    }
}
