using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.QRScan
{
    public class AppointmentRes
    {
        [JsonProperty("queue_token")]
        public string AppointmentId { get; set; }

        [JsonProperty("person_name_mm")]
        public string MName { get; set; }

        [JsonProperty("person_name_en")]
        public string EName { get; set; }

        [JsonProperty("birth_date")]
        public DateTime DOB {  get; set; }

        [JsonProperty("father_name_mm")]
        public string FatherName { get; set; }

        [JsonProperty("blood_type")]
        public string Blood { get; set; }

        [JsonProperty("gender")]
        public string Gender { get; set; }

        [JsonProperty("nrc")]
        public string NRC { get; set; }

        [JsonProperty("uid")]
        public string UID { get; set; }

        [JsonProperty("application_id")]
        public string applicantid { get; set; }

        [JsonProperty("package_code")]
        public string PCode { get; set; }

        [JsonProperty("card_issue_office")]
        public string cardIssueOffice { get; set; }

        [JsonProperty("card_status")]
        public int Status { get; set; }

        [JsonProperty("card_issue_office_name")]
        public string MCardIssueOffice { get; set; }

        [JsonProperty("current_address")]
        public string Address { get; set; }

        [JsonProperty("phone_no")]
        public string Phno { get; set; }

        [JsonProperty("photo")]
        public string Photo { get; set; }

        [JsonProperty("photo_status")]
        public string PhotoStatus { get; set; }
    }
}
