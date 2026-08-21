namespace EIDCardPrint.Models.DTO.ReceivedCard
{
    public class ReceivedCardRes
    {
        public bool Success { get; set; }

        public string? Message { get; set; }

        public string? PackageCode { get; set; }

        public string? Status { get; set; }
    }
}
