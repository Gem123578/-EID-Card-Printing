namespace EIDCardPrint.Models
{
    public class IssuedCardViewModel
    {
        public byte QRCode { get; set; }
        public string MName { get; set; }
        public string EName { get; set; }
        public int UID { get; set; }
        public int PackagedNo { get; set; }
        public string AppointNo { get; set; }
        public string CardNo { get; set; }
        public string Address { get; set; }
        public string NRC { get; set; }
        public string FatherName { get; set; }
        public DateTime DOB { get; set; }
        public string Gender { get; set; }
        public string BloodType { get; set; }
        public DateTime DOE { get; set; }
        public string Photo { get; set; }
        public string OfficeName { get; set; }

        public string Phno { get; set; }

        public bool IsRepresentative { get; set; }
        public RepresentativeViewModel RepPeople { get; set; }
    }
}
