using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.Applicants
{
    public class ApplicantListRequest
    {
        [JsonProperty("current_page_number")]
        public int CurrentPageNumber { get; set; }


        [JsonProperty("applicant_per_page")]
        public int ApplicantPerPage { get; set; }


        [JsonProperty("office_code")]
        public string OfficeCode { get; set; } = string.Empty;


        [JsonProperty("is_printed")]
        public int? IsPrinted { get; set; }


        [JsonProperty("from_date")]
        public string? FromDate { get; set; }


        [JsonProperty("to_date")]
        public string? ToDate { get; set; }
    }
}
