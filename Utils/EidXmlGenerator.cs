using EIDCardPrint.Models;
using EIDCardPrint.Models.EidCardXMl;
using Newtonsoft.Json.Linq;
using System.Xml.Linq;

namespace EIDCardPrint.Utils
{
    public class EidXmlGenerator
    {
        private readonly string _templatePath;
        private readonly string _outputDirectory;

        public EidXmlGenerator()
        {
            var baseDirectory = AppContext.BaseDirectory;

            _templatePath = Path.Combine(
                baseDirectory,
                "EIDCard.xml"
            );

            _outputDirectory = Path.Combine(
                baseDirectory,
                "GeneratedXml"
            );

            Directory.CreateDirectory(_outputDirectory);

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

            // Check XML template
            if (!File.Exists(_templatePath))
            {
                return new EidXmlRes
                {
                    Success = false,
                    Message = $"XML template not found: {_templatePath}"
                };
            }

            try
            {
                var document = XDocument.Load(
                    _templatePath,
                    LoadOptions.PreserveWhitespace
                );

                // =========================
                // Dynamic fields
                // =========================

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
                    model.DOE.ToString("yyyyMMdd")
                );

                SetField(
                    document,
                    "NRCNo",
                    model.NRC
                );

                // Image can be NULL
                SetField(
                    document,
                    "Photo",
                    model.Image
                );

                // =========================
                // File name
                // =========================

                var applicantId =
                    SanitizeFileName(model.ApplicantId);

                var fileName =
                    $"{applicantId}.xml";

                var outputPath =
                    Path.Combine(
                        _outputDirectory,
                        fileName
                    );

                // =========================
                // Save XML
                // =========================

                document.Save(
                    outputPath,
                    SaveOptions.DisableFormatting
                );

                // Check generated file
                if (!File.Exists(outputPath))
                {
                    return new EidXmlRes
                    {
                        Success = false,
                        Message =
                            $"XML file was not created: {outputPath}"
                    };
                }

                return new EidXmlRes
                {
                    Success = true,
                    Message = "XML generated successfully.",
                    FileName = fileName,
                    FilePath = outputPath
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

        private static string SanitizeFileName(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return "Unknown";
            }

            foreach (var invalidChar
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
