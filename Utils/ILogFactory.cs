using log4net;

namespace EIDCardPrint.Utils
{
    public interface ILogFactory
    {
        ILog CreateLogger<T>();
    }
}
