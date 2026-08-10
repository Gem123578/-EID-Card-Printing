namespace EIDCardPrint.Models
{
    public class ApplicantListPageView
    {
        public int RecordCount { get; set; }

        public int CurrentPageNumber { get; set; }

        public int ApplicantPerPage { get; set; }

        public string OfficeCode { get; set; }

        public List<ApplicantListView> Applicants { get; set; } 
    }
}
