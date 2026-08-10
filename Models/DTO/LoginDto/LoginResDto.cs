using Newtonsoft.Json;
using System.Text.Json.Serialization;

namespace EIDCardPrint.Models.DTO.LoginDto
{
    public class LoginResDto
    {
        [JsonProperty("response_status")]
        public int ResponseStatus { get; set; }


        [JsonProperty("success")]
        public bool Success { get; set; }


        [JsonProperty("token")]
        public string Token { get; set; }


        [JsonProperty("last_login_time")]
        public string LastLoginTime { get; set; }


        [JsonProperty("last_password_changed")]
        public string LastPasswordChanged { get; set; }


        [JsonProperty("user")]
        public UserInfo User { get; set; }
    }
}
