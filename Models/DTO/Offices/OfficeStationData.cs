using Newtonsoft.Json;

namespace EIDCardPrint.Models.DTO.Offices
{
    public class OfficeStationData
    {
        [JsonProperty("station_name")]
        public string StationName { get; set; }

        [JsonProperty("division_code")]
        public string DivisionCode { get; set; }


        [JsonProperty("city_en")]
        public string CityEn { get; set; }

        [JsonProperty("station_code")]
        public string StationCode { get; set; }

        [JsonProperty("address")]
        public string Address { get; set; }

        [JsonProperty("start_date")]
        public string StartDate { get; set; }

        [JsonProperty("station_type")]
        public string StationType { get; set; }
    }
}