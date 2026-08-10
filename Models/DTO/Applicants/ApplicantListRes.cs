using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.Applicants
{
    public class ApplicantListRes
    {
        [JsonProperty("response_Status")]
        public int ResponseStatus { get; set; }

        [JsonProperty("record_count")]
        public int RecordCount { get; set; }
        
        [JsonProperty("data")]
        public List<ApplicantDto> Data { get; set; } = new List<ApplicantDto>();
    }
}
