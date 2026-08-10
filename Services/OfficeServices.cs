using EIDCardPrint.Models.DTO.Offices;
using System.Net.Http.Headers;
using System.Text.Json;

namespace EIDCardPrint.Services
{
    public class OfficeServices : IOfficeServices
    {
        private readonly HttpClient _httpClient;

        public OfficeServices(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<OfficeDataRes>> GetOffices(string token)
        {
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);

            var response = await _httpClient.GetAsync(
                "http://192.168.13.225:8001/api/get-offices"
            );

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<OfficeDataRes>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            );

            return await Task.FromResult(result?.Offices ?? new List<OfficeStationData>());
        }
    }
}
