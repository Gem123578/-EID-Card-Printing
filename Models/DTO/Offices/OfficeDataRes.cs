using EIDCardPrint.Models.DTO.Applicants;
using EIDCardPrint.Models.DTO.LoginDto;
using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.Offices
{
    public class OfficeDataRes
    {
        [JsonProperty("response_Status")]
        public int ResponseStatus { get; set; }


        [JsonProperty("record_count")]
        public int RecordCount { get; set; }


        [JsonProperty("message")]
        public string Message { get; set; }


        [JsonProperty("offices")]
        public List<OfficeStationData> Offices { get; set; } = new List<OfficeStationData>();
    }
}
