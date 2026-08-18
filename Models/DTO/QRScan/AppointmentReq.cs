using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.QRScan
{
    public class AppointmentReq
    {
        [JsonProperty("queue_token")]
        public string AppointmentId { get; set; }

        [JsonProperty("issue_office")]
        public string Office { get; set; }

        [JsonProperty("uid")]
        public string UID { get; set; }
    }
}
