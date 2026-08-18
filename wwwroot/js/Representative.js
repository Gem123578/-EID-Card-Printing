document.addEventListener('DOMContentLoaded', function () {
    const modalElement = document.getElementById('representativeModal');
    const radioButton = document.getElementById('relationship');

    modalElement.addEventListener('hidden.bs.modal', function () {
        radioButton.checked = false;
    });
});

////Fetch 
//fetchOffices();

//// FETCH OFFICE

//async function fetchOffices() {

//    try {

//        const response = await fetch('/Home/GetOffices');

//        if (!response.ok) {

//            throw new Error(`HTTP Error: ${response.status}`);
//        }

//        const data = await response.json();

//        const officeSelect = $('#officeSelect');

//        officeSelect.empty();

//        officeSelect.append(new Option('-- Office Stations ရွေးပါ --', ''));

//        data.forEach(function (office) {

//            officeSelect.append(new Option(office.stationName, office.stationCode));

//        });

//        officeSelect.select2
//            ({
//                placeholder: '-- Office Stations ရွေးပါ --',

//                allowClear: true,

//                width: '100%'
//            });

//    }
//    catch (error) {

//        console.error("Office API Error:", error);

//    }
//}

//QR
//document.addEventListener('DOMContentLoaded', function () {

//    const txtQr = document.getElementById("qrInput");

//    if (!txtQr) {
//        console.error("qrInput not found.");
//        return;
//    }

//    // Page load မှာ QR input ကို focus
//    txtQr.focus();

//    txtQr.addEventListener("keydown", function (e) {

//        if (e.key !== "Enter") {
//            return;
//        }

//        e.preventDefault();

//        const encryptedData = this.value.trim();

//        // Scan value ကို မပျောက်ခင် သိမ်းထားပါ
//        this.value = "";

//        if (!encryptedData) {

//            showAppAlert({
//                title: "Error Message",
//                type: "error",
//                message: "QR Code is empty."
//            });

//            txtQr.focus();
//            return;
//        }

//        // Get selected office
//        const issueOffice = $('#officeSelect').val();

//        if (!issueOffice) {

//            showAppAlert({
//                title: "Information Message",
//                type: "information",
//                message: "ရုံးအမည် တစ်ခုကိုရွေးချယ်ပါ"
//            });

//            $('#officeSelect').select2('open');

//            return;
//        }

//        const requestData = {
//            qrCode: encryptedData,
//            officeCode: issueOffice
//        };

//        const token =
//            $('input[name="__RequestVerificationToken"]').val();

//        $.ajax({
//            url: '/IssuedCard/ScanQRCode',
//            type: 'POST',
//            contentType: 'application/json',

//            headers: {
//                "RequestVerificationToken": token
//            },

//            data: JSON.stringify({
//                QRcode: encryptedData,
//                OfficeCode: issueOffice
//            }),

//            success: function (res) {

//                if (res.logout) {
//                    window.location.href = "/Login";
//                    return;
//                }

//                if (!res.success) {

//                    showAppAlert({
//                        title: "Error Message",
//                        type: "error",
//                        message: res.message
//                    });

//                    txtQr.focus();
//                    return;
//                }

//                console.log("Queue Token:", res.queueToken);
//                console.log("UID:", res.uid);
//                console.log("Office:", res.issueOffice);
//                console.log("Appointment:", res.appointment);

//                showAppAlert({
//                    title: "Information Message",
//                    type: "information",
//                    message: res.message || "QR Code processed successfully."
//                });

//                txtQr.focus();
//            },

//            error: function (xhr, status, error) {

//                console.error("QR Error:", xhr.responseText);

//                showAppAlert({
//                    title: "Error Message",
//                    type: "error",
//                    message: "Server connection failed."
//                });

//                txtQr.focus();
//            }
//        });
//    });
//});

document.addEventListener('DOMContentLoaded', function () {

    const txtQr = document.getElementById("qrInput");

    if (!txtQr) {
        console.error("qrInput not found.");
        return;
    }

    txtQr.focus();

    txtQr.addEventListener("keydown", function (e) {

        if (e.key !== "Enter") {
            return;
        }

        e.preventDefault();

        const fullQr = this.value.trim();

        console.log("FULL QR:", fullQr);

        if (!fullQr) {
            return;
        }

        try {

            const url = new URL(fullQr);

            const qrData = url.searchParams.get("param1");

            if (!qrData) {
                console.error("param1 not found");
                return;
            }

            // TextBox မှာ data only
            txtQr.value = qrData;

            console.log("QR DATA ONLY:", qrData);

            const issueOffice = $('#officeSelect').val();

            if (!issueOffice) {
                showAppAlert({
                    title: "Information Message",
                    type: "information",
                    message: "ရုံးအမည် တစ်ခုကိုရွေးချယ်ပါ"
                });

                return;
            }

            // Controller ကို data only ပို့
            const requestData = {
                QRcode: qrData,
                OfficeCode: issueOffice
            };

            console.log("SEND TO CONTROLLER:", requestData);

            $.ajax({
                url: '/IssuedCard/ScanQRCode',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestData),

                success: function (res) {

                    console.log("SERVER RESPONSE:", res);

                    if (!res.success) {
                        showAppAlert({
                            title: "Error Message",
                            type: "error",
                            message: res.message
                        });
                        return;
                    }

                    console.log("Queue Token:", res.queueToken);
                    console.log("UID:", res.uid);
                    console.log("Appointment:", res.appointment);
                },

                error: function (xhr) {

                    console.error(
                        "QR ERROR:",
                        xhr.responseText
                    );
                }
            });

        }
        catch (error) {

            console.error("Invalid QR:", error);
        }
    });
});

//data return 
document.addEventListener("DOMContentLoaded", function () {

    console.log("IssuedCard.js loaded.");

    const txtQr = document.getElementById("qrInput");
    const officeSelect = $("#officeSelect");

    if (!txtQr) {
        console.error("qrInput not found.");
        return;
    }


    // ==========================================
    // LOAD OFFICES
    // ==========================================

    fetchOffices();


    async function fetchOffices() {

        try {

            const response = await fetch("/Home/GetOffices");

            if (!response.ok) {
                throw new Error(
                    `HTTP Error: ${response.status}`
                );
            }

            const data = await response.json();

            officeSelect.empty();

            officeSelect.append(
                new Option(
                    "-- Office Stations ရွေးပါ --",
                    ""
                )
            );


            data.forEach(function (office) {

                officeSelect.append(
                    new Option(
                        office.stationName,
                        office.stationCode
                    )
                );

            });


            officeSelect.select2({
                placeholder:
                    "-- Office Stations ရွေးပါ --",

                allowClear: true,

                width: "100%"
            });


        }
        catch (error) {

            console.error(
                "Office API Error:",
                error
            );

        }

    }


    // ==========================================
    // QR INPUT
    // ==========================================

    txtQr.focus();


    txtQr.addEventListener(
        "keydown",
        function (e) {

            // Scanner usually sends ENTER
            if (e.key !== "Enter") {
                return;
            }

            e.preventDefault();


            const fullQr =
                txtQr.value.trim();


            console.log(
                "FULL QR:",
                fullQr
            );


            if (!fullQr) {

                showError(
                    "QR Code is empty."
                );

                return;
            }


            // ==========================================
            // GET param1 DATA
            // ==========================================

            let qrData = "";


            try {

                const url =
                    new URL(fullQr);


                qrData =
                    url.searchParams.get("param1");


                if (!qrData) {

                    showError(
                        "param1 data မတွေ့ပါ။"
                    );

                    return;
                }


            }
            catch (error) {

                console.error(
                    "QR URL parse error:",
                    error
                );
                return;
            }


            // ==========================================
            // SHOW DATA ONLY IN QR TEXTBOX
            // ==========================================

            txtQr.value = qrData;


            console.log(
                "QR DATA ONLY:",
                qrData
            );


            // ==========================================
            // GET OFFICE
            // ==========================================

            const issueOffice =
                officeSelect.val();


            console.log(
                "OFFICE:",
                issueOffice
            );


            if (!issueOffice) {

                showInfo(
                    "ရုံးအမည် တစ်ခုကိုရွေးချယ်ပါ"
                );

                officeSelect.select2("open");

                return;
            }


            // ==========================================
            // REQUEST DTO
            // ==========================================

            const requestData = {

                QRcode: qrData,

                OfficeCode: issueOffice

            };


            console.log(
                "SEND TO CONTROLLER:",
                requestData
            );


            // ==========================================
            // POST CONTROLLER
            // ==========================================

            $.ajax({

                url:
                    "/IssuedCard/ScanQRCode",

                type:
                    "POST",

                contentType:
                    "application/json; charset=utf-8",

                data:
                    JSON.stringify(requestData),


                // ======================================
                // SUCCESS
                // ======================================

                success:
                    function (res) {

                        console.log(
                            "SERVER RESPONSE:",
                            res
                        );


                        if (!res.success) {

                            showError(
                                res.message ||
                                "QR processing failed."
                            );

                            txtQr.focus();

                            return;
                        }


                        // ==================================
                        // APPOINTMENT DATA
                        // ==================================

                        const data =
                            res.appointment;


                        if (!data) {

                            showError(
                                "Appointment data မရပါ။"
                            );

                            return;
                        }


                        console.log(
                            "APPOINTMENT DATA:",
                            data
                        );


                        // ==================================
                        // FILL TEXTBOXES
                        // ==================================

                        $("#packageCode").val(
                            data.package_code ?? ""
                        );


                        const data = res.appointment;

                        console.log("APPOINTMENT DATA:", data);

                        if (!data) {
                            showError("Appointment data မရပါ။");
                            return;
                        }

                        // ==================================
                        // FILL TEXTBOXES
                        // ==================================

                        $("#packageCode").val(data.pCode ?? "");

                        $("#appointmentNo").val(data.applicantid ?? "");

                        $("#uid").val(data.uid ?? res.uid ?? "");

                        $("#mName").val(data.mName ?? "");

                        $("#eName").val(data.eName ?? "");

                        $("#fatherName").val(data.fatherName ?? "");

                        $("#dob").val(
                            data.dob
                                ? data.dob.substring(0, 10)
                                : ""
                        );

                        $("#nrc").val(data.nrc ?? "");

                        $("#bloodType").val(data.blood ?? "");

                        $("#phoneNo").val(data.phno ?? "");

                        $("#currentAddress").val(data.address ?? "");


                        // ==================================
                        // GENDER
                        // ==================================

                        if (
                            data.gender === "Male"
                        ) {

                            $("#Male")
                                .prop(
                                    "checked",
                                    true
                                );

                        }


                        else if (
                            data.gender === "Female"
                        ) {

                            $("#Female")
                                .prop(
                                    "checked",
                                    true
                                );

                        }


                        // ==================================
                        // OFFICE
                        // ==================================

                        officeSelect
                            .val(
                                res.issueOffice
                            )
                            .trigger("change");


                        // ==================================
                        // PHOTO
                        // ==================================

                        if (data.photo) {
                            $("#profilePhoto").attr(
                                "src",
                                "data:image/jpeg;base64," + data.photo
                            );
                        }


                        // ==================================
                        // LOG
                        // ==================================

                        console.log(
                            "Queue Token:",
                            res.queueToken
                        );

                        console.log(
                            "UID:",
                            res.uid
                        );

                        console.log(
                            "Office:",
                            res.issueOffice
                        );


                        console.log(
                            "Person:",
                            data.person_name_mm
                        );


                        // ==================================
                        // SUCCESS MESSAGE
                        // ==================================

                        showSuccess(
                            "QR Code data successfully loaded."
                        );


                        txtQr.focus();

                    },


                // ======================================
                // ERROR
                // ======================================

                error:
                    function (
                        xhr,
                        status,
                        error
                    ) {

                        console.error(
                            "QR ERROR:",
                            xhr.responseText
                        );


                        let message =
                            "Server connection failed.";


                        try {

                            const response =
                                JSON.parse(
                                    xhr.responseText
                                );


                            if (response.message) {

                                message =
                                    response.message;

                            }

                        }
                        catch (e) {

                            // response is not JSON

                        }


                        showError(
                            message
                        );


                        txtQr.focus();

                    }

            });

        }
    );


    // ==========================================
    // ALERT FUNCTIONS
    // ==========================================

    function showError(message) {

        if (typeof showAppAlert === "function") {

            showAppAlert({

                title:
                    "Error Message",

                type:
                    "error",

                message:
                    message

            });

        }
        else {

            alert(message);

        }

    }


    function showInfo(message) {

        if (typeof showAppAlert === "function") {

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

        if (typeof showAppAlert === "function") {

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