namespace EIDCardPrint.Services
{
    public interface IQRCodeServices
    {
        string DecryptQRCode(string encryptStr);

        string DecryptQRCode1(string cipherText, string key);
    }
}
