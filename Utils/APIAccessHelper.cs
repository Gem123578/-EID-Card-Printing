using EIDCardPrint.Common;
using log4net;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;

namespace EIDCardPrint.Utils
{
    public class APIAccessHelper : IAPIAccessHelper
    {
        public static readonly string BaseUrl = "http://192.168.13.225:8001/";

        private readonly ILog _logger;

        public APIAccessHelper(ILogFactory logFactory)
        {
            _logger = logFactory.CreateLogger<APIAccessHelper>();
        }
        public async Task<T> SendRequestAsync<T>(RequestDto request)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromMinutes(2);

                    HttpRequestMessage requestMessage = new HttpRequestMessage
                    {
                        RequestUri = new Uri(request.RequestUrl)
                    };

                    switch (request.RequestType)
                    {
                        case eHttpRequestType.POST:
                            requestMessage.Method = HttpMethod.Post;
                            break;

                        case eHttpRequestType.PUT:
                            requestMessage.Method = HttpMethod.Put;
                            break;

                        case eHttpRequestType.DELETE:
                            requestMessage.Method = HttpMethod.Delete;
                            break;

                        default:
                            requestMessage.Method = HttpMethod.Get;
                            break;
                    }

                    if (request.Data != null)
                    {
                        string body = JsonConvert.SerializeObject(request.Data);

                        Debug.WriteLine($"Request Body: {body}");

                        requestMessage.Content = new StringContent(
                            body,
                            Encoding.UTF8,
                            "application/json");
                    }

                    if (!string.IsNullOrEmpty(request.AccessToken))
                    {
                        client.DefaultRequestHeaders.Authorization =
                            new AuthenticationHeaderValue(
                                "Bearer",
                                request.AccessToken);
                    }

                    HttpResponseMessage response = await client.SendAsync(requestMessage);

                    string json = await response.Content.ReadAsStringAsync();

                    response.EnsureSuccessStatusCode();

                    var result = JsonConvert.DeserializeObject<T>(json);
                    Debug.WriteLine($"DESERIALIZED: {JsonConvert.SerializeObject(result)}");
                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.Error(
                   $"API Exception: {request.RequestUrl}",
                   ex
              );

                throw;
            }
        }
    }
}
