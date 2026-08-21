using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.ChangeIssueStatus
{
    public class IssueStatusRes
    {
        [JsonProperty("response_status")]
        public string Status { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("new_status")]
        public string IssueStatus { get; set; }
    }
}
