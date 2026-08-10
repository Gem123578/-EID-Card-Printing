using EIDCardPrint.Common;

namespace EIDCardPrint.Utils
{
    public class ModelConverter
    {
        internal static RequestDto CreateRequestDto(object data,string rootUrl,string apiUrl,eHttpRequestType requestType,string token = null)
        {
            RequestDto request = new RequestDto
            {
                RequestUrl = string.Format(
                    "{0}/{1}",
                    rootUrl.TrimEnd('/'),
                    apiUrl.TrimStart('/')
                ),

                RequestType = requestType,

                AccessToken = token,

                Data = data
            };

            return request;
        }
    }
}
