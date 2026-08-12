using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace EIDCardPrint.Models.DTO.PrintedDto
{
    public class MarkPrintedRequest
    {
        [JsonPropertyName("application_ids")]
        public List<string> application_ids { get; set; }
    }
}
