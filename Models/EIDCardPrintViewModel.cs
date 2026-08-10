namespace EIDCardPrint.Models
{
    public class EIDCardPrintViewModel
    {
        public string? ApplicantId { get; set; }
        public string MName { get; set; }
        public string EName { get; set; }
        public string Sex { get; set; }
        public DateTime DOB { get; set; }
        public string UID { get; set; }
        public DateTime DOE { get; set; }
        public string NRC { get; set; }
        public byte[] Image { get; set; }
        public byte[] QR { get; set; }

        public string DateRange { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

    }
}
