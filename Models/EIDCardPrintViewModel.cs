namespace EIDCardPrint.Models
{
    public class EIDCardPrintViewModel
    {
        public  bool IsPrinted { get; set; }
        public string? ApplicantId { get; set; }
        public string MName { get; set; }
        public string EName { get; set; }
        public string Sex { get; set; }
        public DateTime? DOB { get; set; }
        public string UID { get; set; }
        public DateTime? DOE { get; set; }
        public string NRC { get; set; }
        public string Image { get; set; }
        public string QR { get; set; }

        public int CurrentPageNumber { get; set; }

        public int ApplicantPerPage { get; set; }

        public string? OfficeCode { get; set; }

        public string? SearchTerm { get; set; }

        public string? SelectedDate { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

    }
}
