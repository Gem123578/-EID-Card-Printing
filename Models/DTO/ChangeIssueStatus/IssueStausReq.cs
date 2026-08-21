using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace EIDCardPrint.Models.DTO.ChangeIssueStatus
{
    public class IssueStausReq
    {
        [JsonProperty("application_id")]
        public string ApplicantId { get; set; }

        [JsonProperty("issued_date")]
        public DateTime? IssueDate { get; set; }

        [JsonProperty("issue_person")]
        public List<IssuePerson> IssuePerson { get; set; }
    }
}
