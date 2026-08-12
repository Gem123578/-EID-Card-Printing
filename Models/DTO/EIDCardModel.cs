namespace EIDCardPrint.Models.DTO
{
    public class EIDCardModel
    {
        public string ApplicantId { get; set; } = string.Empty;

        public string Uid { get; set; } = string.Empty;

        public string? OfficeCode { get; set; }

        public int CurrentPageNumber { get; set; } 

        public int ApplicantPerPage { get; set; } 

        public string? SearchTerm { get; set; }

        public string? SelectedDate { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}
