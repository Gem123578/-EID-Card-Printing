using EIDCardPrint.Common;

namespace EIDCardPrint.Utils
{
    public interface IAPIAccessHelper
    {
        Task<T>SendRequestAsync<T>(RequestDto request);
    }
}
