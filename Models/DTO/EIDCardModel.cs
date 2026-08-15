namespace EIDCardPrint.Models.DTO
{
    public class EIDCardModel
    {
        public string ApplicantId { get; set; }

        public string Uid { get; set; }

        public string? OfficeCode { get; set; }

        public int CurrentPageNumber { get; set; } 

        public int ApplicantPerPage { get; set; } 

        public string? SearchTerm { get; set; }

        public string? SelectedDate { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}
