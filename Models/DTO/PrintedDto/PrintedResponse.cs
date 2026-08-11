using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.PrintedDto
{
    public class PrintedResponse
    {
        [JsonProperty("response_status")]
        public string ResponseStatus { get; set; }


        [JsonProperty("message")]
        public string Message { get; set; }

    }
}
