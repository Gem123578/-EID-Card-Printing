using System.Drawing;
using System.Security.Cryptography;
using System.Text;
using ZXing;
using ZXing.Common;
using ZXing.Windows.Compatibility;

namespace EIDCardPrint.Services
{
    public class QRCodeServices : IQRCodeServices
    {
        private const string EncryptionKey = "eidonlineKey20z5";
        private const string EncryptionIV = "e!d0nlin3@IV2025";

        public string DecryptQRCode1(string cipherText, string key)
        {
            try
            {
                if(string.IsNullOrWhiteSpace(cipherText)) return string.Empty;

                if(string.IsNullOrWhiteSpace(key)) return string.Empty;

                //URL decode
                cipherText = Uri.UnescapeDataString(cipherText);

                //Key must exactly 16 bytes
                string cleanKey = key.PadRight(16).Substring(0, 16);

                byte[] aseKey = Encoding.UTF8.GetBytes(cleanKey);
                byte[] aseIV = new byte[16];

                //Base 64 Decode 
                byte[] cipherBytes =
                    Convert.FromBase64String(cipherText);

                using Aes aes = Aes.Create();

                aes.KeySize = 128;
                aes.BlockSize = 128;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                aes.Key = aseKey;
                aes.IV = aseIV;

                using ICryptoTransform decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

                byte[] decryptedBytes = decryptor.TransformFinalBlock(cipherBytes,0,cipherBytes.Length);

                return Encoding.UTF8.GetString(decryptedBytes);

            }
            catch 
            { 
                return string.Empty;
            }
        }

        public string DecryptQRCode(string encryptStr)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(encryptStr))
                    return string.Empty;

                //fix URL encoded QR data
                encryptStr = Uri.UnescapeDataString(encryptStr);

                //QR sometimes converts + to space
                encryptStr = encryptStr.Replace(" ", "+");

                //Base64 decode
                byte[] cipherBytes = Convert.FromBase64String(encryptStr);

                //AES key
                byte[] key = Encoding.UTF8.GetBytes(EncryptionKey);

                //AES IV
                byte[] iv = Encoding.UTF8.GetBytes(EncryptionIV);

                using Aes aes = Aes.Create();

                aes.KeySize = 128;
                aes.BlockSize = 128;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                aes.Key = key;
                aes.IV = iv;

                using ICryptoTransform decryptor = aes.CreateDecryptor();

                byte[] descryptedBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
                return Encoding.UTF8.GetString(descryptedBytes);

            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
