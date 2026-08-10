using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.LoginDto
{
    public class UserInfo
    {
        [JsonProperty("employee_id")]
        public string EmployeeId { get; set; }


        [JsonProperty("display_name")]
        public string DisplayName { get; set; }


        [JsonProperty("role_level")]
        public string RoleLevel { get; set; }


        [JsonProperty("role_name")]
        public string RoleName { get; set; }


        [JsonProperty("station_name")]
        public string StationName { get; set; }


        [JsonProperty("office_code")]
        public string OfficeCode { get; set; }


        [JsonProperty("phone_no")]
        public string PhoneNo { get; set; }


        [JsonProperty("permissions")]
        public List<string> Permissions { get; set; }


        [JsonProperty("email")]
        public string Email { get; set; }
    }
}