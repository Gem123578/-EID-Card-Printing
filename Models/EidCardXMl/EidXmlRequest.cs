namespace EIDCardPrint.Models.EidCardXMl
{
    public class EidXmlRequest
    {
        public int CurrentPageNumber { get; set; }

        public int ApplicantPerPage { get; set; }

        public string? ApplicationId { get; set; }

        public string? Uid { get; set; }

        public string? Nrc { get; set; }

        public string? Gender { get; set; }

        public string? BirthDate { get; set; }

        public string? PersonNameMm { get; set; }

        public string? PersonNameEn { get; set; }

        public string? Photo { get; set; }

        public string? Qr { get; set; }
    }
}
