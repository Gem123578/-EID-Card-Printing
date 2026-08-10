using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.Applicants
{
    public class ApplicantDto
    {

        [JsonProperty("application_id")]
        public string ApplicationId { get; set; }


        [JsonProperty("uid")]
        public string Uid { get; set; }


        [JsonProperty("nrc")]
        public string Nrc { get; set; }


        [JsonProperty("gender")]
        public string Gender { get; set; }


        [JsonProperty("birth_date")]
        public DateTime? BirthDate { get; set; }


        [JsonProperty("person_name_mm")]
        public string PersonNameMm { get; set; }    


        [JsonProperty("person_name_en")]
        public string PersonNameEn { get; set; }   
        

        [JsonProperty("printed_date")]
        public DateTime? PrintedDate { get; set; }

        
        [JsonProperty("photo")]
        public string Photo { get; set; } 
    }
}