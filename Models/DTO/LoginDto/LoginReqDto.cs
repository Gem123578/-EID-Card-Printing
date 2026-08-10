using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.LoginDto
{
    public class LoginReqDto
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }

    }
}
