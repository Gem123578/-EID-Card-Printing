using EIDCardPrint.Models;
using EIDCardPrint.Models.EidCardXMl;
using Newtonsoft.Json.Linq;
using System.Xml.Linq;

namespace EIDCardPrint.Utils
{
    public class EidXmlGenerator
    {
        private readonly string _templatePath;

        public EidXmlGenerator()
        {
            _templatePath = Path.Combine(
                AppContext.BaseDirectory,
                "EIDCard.xml"
            );

        }

        public EidXmlRes Generate(EIDCardPrintViewModel model)
        {
            if (model == null)
            {
                return new EidXmlRes
                {
                    Success = false,
                    Message = "EID card model is null."
                };
            }

            if (!File.Exists(_templatePath))
            {
                return new EidXmlRes
                {
                    Success = false,
                    Message =
                        $"XML template not found: {_templatePath}"
                };
            }

            try
            {
                var document = XDocument.Load(
                    _templatePath,
                    LoadOptions.PreserveWhitespace
                );

                SetField(
                    document,
                    "NameInBurmese",
                    model.MName
                );

                SetField(
                    document,
                    "NameInEnglish",
                    model.EName
                );

                SetField(
                    document,
                    "Gender",
                    model.Sex
                );

                SetField(
                    document,
                    "DateOfBirth",
                    model.DOB?.ToString("yyyyMMdd")
                );

                SetField(
                    document,
                    "UIDNo",
                    model.UID
                );

                SetField(
                    document,
                    "DateOfExpiry",
                    model.DOE?.ToString("yyyyMMdd")
                );

                SetField(
                    document,
                    "NRCNo",
                    model.NRC
                );

                SetField(
                    document,
                    "Photo",
                    model.Image
                );

                var applicantId =
                    SanitizeFileName(model.ApplicantId);

                var fileName =
                    $"{applicantId}.xml";


                using var memoryStream =
                    new MemoryStream();

                document.Save(
                    memoryStream,
                    SaveOptions.DisableFormatting
                );

                var fileBytes =
                    memoryStream.ToArray();

                return new EidXmlRes
                {
                    Success = true,

                    Message =
                        "XML generated successfully.",

                    FileName =
                        fileName,

                    FileBytes =
                        fileBytes
                };
            }
            catch (Exception ex)
            {
                return new EidXmlRes
                {
                    Success = false,

                    Message =
                        $"XML generation failed: {ex.Message}"
                };
            }
        }

        private static string SanitizeFileName(
            string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "Unknown";
            }

            foreach (
                var invalidChar
                in Path.GetInvalidFileNameChars())
            {
                value = value.Replace(
                    invalidChar,
                    '_'
                );
            }

            return value;
        }

        private static void SetField(
            XDocument document,
            string fieldClass,
            string? value)
        {
            var field = document
                .Descendants("Field")
                .FirstOrDefault(x =>
                    string.Equals(
                        (string?)x.Attribute("class"),
                        fieldClass,
                        StringComparison.OrdinalIgnoreCase
                    )
                );

            if (field == null)
            {
                return;
            }

            var valueElement =
                field.Element("Value");

            if (valueElement == null)
            {
                field.Add(
                    new XElement(
                        "Value",
                        value ?? string.Empty
                    )
                );

                return;
            }

            valueElement.Value =
                value ?? string.Empty;
        }
    }
}
