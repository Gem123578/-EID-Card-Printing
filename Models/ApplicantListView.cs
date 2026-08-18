using EIDCardPrint.Models.DTO.Offices;

namespace EIDCardPrint.Models
{
    public class ApplicantListView
    {
        public string ApplicantId { get; set; }

        public string UId { get; set; }

        public string NRC { get; set; }

        public string Gender  { get; set; }

        public DateTime? DOB { get; set; }

        public DateTime DOE { get; set; }

        public string PersonNameMM { get; set; }

        public string PersonNameEN { get; set; }

        public DateTime? PrintedDate { get; set; }

        public string Photo { get; set; }

        //Date Range Filter
        public string DateRange { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string? SelectedDate { get; set; }

        //Office Filter
        public string? SearchTerm { get; set; }

        public string? OfficeName { get; set; }

        public string? OfficeCode { get; set; }

    }
}
