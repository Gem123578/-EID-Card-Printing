document.addEventListener('DOMContentLoaded', function () {
    const modalElement = document.getElementById('representativeModal');
    const radioButton = document.getElementById('relationship');

    modalElement.addEventListener('hidden.bs.modal', function () {
        radioButton.checked = false;
    });
});

//data return 
document.addEventListener("DOMContentLoaded", function () {

    const txtQr = document.getElementById("qrInput");
    const officeSelect = $("#officeSelect");

    if (!txtQr) {
        console.error("qrInput not found.");
        return;
    }

    // ==========================================
    // LOAD OFFICES
    // ==========================================

    loadOffices();


    async function loadOffices() {

        try {

            const response = await fetch("/Home/GetOffices");

            if (!response.ok) {
                throw new Error(
                    `HTTP Error: ${response.status}`
                );
            }

            const offices = await response.json();

            // Clear existing options
            officeSelect.empty();

            // Default option
            officeSelect.append(
                new Option(
                    "-- Office Stations ရွေးပါ --",
                    ""
                )
            );

            // Add offices
            offices.forEach(function (office) {

                officeSelect.append(
                    new Option(
                        office.stationName,
                        office.stationCode
                    )
                );

            });

            // Initialize Select2
            if (officeSelect.hasClass("select2-hidden-accessible")) {
                officeSelect.select2("destroy");
            }

            officeSelect.select2({
                placeholder: "-- Office Stations ရွေးပါ --",
                allowClear: true,
                width: "100%"
            });


        }
        catch (error) {


            showError(
                "Office list loading failed."
            );
        }
    }


    // ==========================================
    // QR INPUT
    // ==========================================

    txtQr.focus();

    txtQr.addEventListener("keydown", function (e) {

        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        const fullQr = txtQr.value.trim();

        if (!fullQr) {

            showError(
                "QR Code is empty."
            );

            return;
        }


        // ==========================================
        // GET param1
        // ==========================================

        let qrData = "";

        try {

            const url = new URL(fullQr);

            qrData = url.searchParams.get("param1");

            if (!qrData) {

                showError(
                    "param1 data မတွေ့ပါ။"
                );

                return;
            }

        }
        catch (error) {


            showError(
                "Invalid QR Code."
            );

            return;
        }


        // ==========================================
        // SHOW QR DATA
        // ==========================================

        txtQr.value = qrData;


        // ==========================================
        // GET SELECTED OFFICE
        // ==========================================

        const issueOffice = officeSelect.val();


        if (!issueOffice) {

            showInfo(
                "ရုံးအမည် တစ်ခုကိုရွေးချယ်ပါ"
            );
            txtQr.value = "";
            officeSelect.select2("open");

            return;
        }


        // ==========================================
        // REQUEST
        // ==========================================

        const requestData = {

            QRcode: qrData,

            OfficeCode: issueOffice

        };



        // ==========================================
        // POST CONTROLLER
        // ==========================================

        $.ajax({

            url: "/IssuedCard/ScanQRCode",

            type: "POST",

            contentType:
                "application/json; charset=utf-8",

            data:
                JSON.stringify(requestData),


            // ======================================
            // SUCCESS
            // ======================================

            success: function (res) {


                if (!res.success) {
                    showError(
                        res.message || "QR processing failed."
                    );

                    txtQr.focus();
                    return;
                }

                const data = res.appointment;

                if (!data) {
                    showError("Appointment data မရပါ။");
                    return;
                }

                // ==================================
                // TEXTBOXES
                // ==================================

                $("#packageCode").val(
                    data.pCode ?? ""
                );

                $("#appointmentNo").val(
                    data.applicantid ?? ""
                );

                $("#uid").val(
                    data.uid ?? ""
                );

                $("#mName").val(
                    data.mName ?? ""
                );

                $("#eName").val(
                    data.eName ?? ""
                );

                $("#fatherName").val(
                    data.fatherName ?? ""
                );

                $("#dob").val(
                    data.dob
                        ? data.dob.substring(0, 10)
                        : ""
                );

                $("#nrc").val(
                    data.nrc ?? ""
                );

                $("#bloodType").val(
                    data.blood ?? ""
                );

                $("#phoneNo").val(
                    data.phno ?? ""
                );

                $("#currentAddress").val(
                    data.address ?? ""
                );


                // ==================================
                // GENDER
                // ==================================

                $("#Male").prop("checked", false);
                $("#Female").prop("checked", false);

                if (data.gender === "Male") {
                    $("#Male").prop("checked", true);
                }
                else if (data.gender === "Female") {
                    $("#Female").prop("checked", true);
                }


                // ==================================
                // OFFICE
                // ==================================

                const returnedOffice =
                    data.cardIssueOffice ??
                    res.issueOffice ??
                    "";


                if (returnedOffice) {

                    const officeExists =
                        officeSelect.find(
                            "option[value='" + returnedOffice + "']"
                        ).length > 0;

                    if (officeExists) {

                        officeSelect
                            .val(returnedOffice)
                            .trigger("change");

                    }
                    else {

                        console.warn(
                            "Office option not found:",
                            returnedOffice
                        );

                    }
                }


                // ==================================
                // PHOTO
                // ==================================

                if (data.photo) {

                    $("#profilePhoto").attr(
                        "src",
                        "data:image/jpeg;base64," + data.photo
                    );

                }
                else {

                    // No photo returned
                    $("#profilePhoto").attr(
                        "src",
                        "/images/profile.png"
                    );

                }


                // ==================================
                // SUCCESS
                // ==================================

                disableAppointmentFields();
                txtQr.focus();
            }

        });

    });


    // ==========================================
    // ALERT FUNCTIONS
    // ==========================================

    function showError(message) {

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title: "Error Message",

                type: "error",

                message: message

            });

        }
        else {

            alert(message);

        }
    }


    function showInfo(message) {

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    "Information Message",

                type:
                    "information",

                message:
                    message

            });

        }
        else {

            alert(message);

        }
    }


    function showSuccess(message) {

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    "Information Message",

                type:
                    "information",

                message:
                    message

            });

        }
        else {

            console.log(message);

        }
    }

});

//issue card
document.addEventListener("DOMContentLoaded", function () {

    const page = document.getElementById("issueCardPage");

    if (!page) return;

    const successMessage =
        page.dataset.successMessage;

    if (successMessage) {

        showAppAlert({
            title: "အောင်မြင်ပါသည်",
            message: successMessage,
            type: "success",
            confirmText: "OK",
            showCancel: false
        });

    }

});

document.addEventListener("DOMContentLoaded", function () {

    const modalElement =
        document.getElementById("representativeModal");

    const saveBtn =
        document.getElementById("saveRepresentativeBtn");

    if (!modalElement || !saveBtn) {
        return;
    }

    saveBtn.addEventListener("click", function () {

        const modal =
            bootstrap.Modal.getOrCreateInstance(modalElement);

        modal.hide();
    });

});

function disableAppointmentFields() {

    $("#packageCode").prop("readonly", true);
    $("#appointmentNo").prop("readonly", true);
    $("#uid").prop("readonly", true);
    $("#mName").prop("readonly", true);
    $("#eName").prop("readonly", true);
    $("#fatherName").prop("readonly", true);
    $("#dob").prop("readonly", true);
    $("#nrc").prop("readonly", true);
    $("#bloodType").prop("readonly", true);
    $("#phoneNo").prop("readonly", true);
    $("#currentAddress").prop("readonly", true);

    // Gender Radio Buttons
    $("#Male").prop("readonly", true);
    $("#Female").prop("readonly", true);
}