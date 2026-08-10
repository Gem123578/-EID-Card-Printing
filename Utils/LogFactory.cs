using log4net;

namespace EIDCardPrint.Utils
{
    public class LogFactory : ILogFactory
    {
        public ILog CreateLogger<T>()
        {
            return LogManager.GetLogger(typeof(T));
        }
    }
}
