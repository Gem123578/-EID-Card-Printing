namespace EIDCardPrint.Models
{
    public class ApplicantListPageView
    {
        public int RecordCount { get; set; }

        public bool IsPrinted { get; set; }

        public int CurrentPageNumber { get; set; } 

        public int ApplicantPerPage { get; set; }

        public string OfficeCode { get; set; }
        // Search
        public string? SearchTerm { get; set; }

        // Office dropdown
        public string? OfficeName { get; set; }

        // Date
        public string? DateRange { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }

        public string? SelectedDate { get; set; }

        public List<ApplicantListView> Applicants { get; set; }

        //paging
        public int TotalPages { get; set; }
        

        public bool HasPreviousPage =>
            CurrentPageNumber > 1;

        public bool HasNextPage =>
            CurrentPageNumber < TotalPages;

        public bool IsSearch { get;  set; }
    }
}
