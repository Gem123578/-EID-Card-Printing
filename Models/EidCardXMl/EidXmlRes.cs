namespace EIDCardPrint.Models.EidCardXMl
{
    public class EidXmlRes
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? FileName { get; set; }
        public string? FilePath { get; set; }
        public byte[]? FileBytes { get; set; }
    }
}
