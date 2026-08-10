using EIDCardPrint.Utils;

namespace EIDCardPrint.Common
{
    public class RequestDto
    {
        public string RequestUrl { get; set; }
        public eHttpRequestType RequestType { get; set; }
        public object Data { get; set; }
        public string AccessToken { get; set; }
        public List<Header> Headers { get; set; }
    }
}
