namespace EIDCardPrint.Models
{
    public class ApplicantListView
    {
        public string ApplicantId { get; set; }

        public string UId { get; set; }

        public string NRC { get; set; }

        public string Gender  { get; set; }

        public DateTime? DOB { get; set; }

        public string PersonNameMM { get; set; }

        public string PersonNameEN { get; set; }

        public DateTime? PrintedDate { get; set; }

        public string Photo { get; set; }

        //Date Range Filter
        public string DateRange { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}
