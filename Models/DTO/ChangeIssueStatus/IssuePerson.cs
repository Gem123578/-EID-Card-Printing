using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.ChangeIssueStatus
{
    public class IssuePerson
    {
        [JsonProperty("person_name")]
        public string Name { get; set; }

        [JsonProperty("phone_no")]
        public string Phno { get; set; }

        [JsonProperty("issue_person_type")]
        public string Person_type { get; set; }

        [JsonProperty("nrc_no")]
        public string NRC { get; set; }

        [JsonProperty("relative")]
        public string Relative { get; set; }
    }
}