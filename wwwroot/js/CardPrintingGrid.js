$(document).ready(function () {

    // DATE RANGE

    $('#dateRangeFilter').daterangepicker({

        autoUpdateInput: false,
        autoApply: false,

        opens: 'left',
        drops: 'down',

        parentEl: 'body',
        linkedCalendars: false,
        showDropdowns: true,

        ranges: {

            'Today': [
                moment(),
                moment()
            ],

            'Last 7 Days': [
                moment().subtract(6, 'days'),
                moment()
            ],

            'This Month': [
                moment().startOf('month'),
                moment()
            ],

            'Last Year': [
                moment().subtract(1, 'year').startOf('year'),
                moment().subtract(1, 'year').endOf('year')
            ]

        }

    }, function (start, end, label) {

        let rangeType = 'custom';

        switch (label) {

            case 'Today':
                rangeType = 'today';
                break;

            case 'Last 7 Days':
                rangeType = 'last7';
                break;

            case 'This Month':
                rangeType = 'thisMonth';
                break;

            case 'Last Year':
                rangeType = 'lastYear';
                break;
        }


        // Hidden fields
        $('#dateRangeType').val(rangeType);

        $('#fromDate').val(
            start.format('YYYY-MM-DD')
        );

        $('#toDate').val(
            end.format('YYYY-MM-DD')
        );


        // Display Date
        $('#dateRangeFilter').val(
            start.format('YYYY-MM-DD') +
            ' - ' +
            end.format('YYYY-MM-DD')
        );


        // DATE ရွေးပြီးမှ CLEAR BUTTON ပေါ်

        $('#clearDateRange').addClass('show');

    });


    // PAGE LOAD

    const fromDate =
        $('#fromDate').val();

    const toDate =
        $('#toDate').val();


    if (fromDate && toDate) {

        $('#clearDateRange')
            .addClass('show');

    }
    else {

        $('#clearDateRange')
            .removeClass('show');

    }

    // CLEAR DATE RANGE

    $('#clearDateRange').on(
        'click',
        function () {

            // Display Date Clear
            $('#dateRangeFilter').val('');


            // Hidden values Clear
            $('#dateRangeType').val('');

            $('#fromDate').val('');

            $('#toDate').val('');


            // Clear Button Hide
            $(this).removeClass('show');

        }
    );


    // SEARCH

    $('#cardSearchForm').on(
        'submit',
        function () {

            const searchInput =
                document.getElementById(
                    'SearchTerm'
                );

            if (searchInput) {

                searchInput.value =
                    searchInput.value
                        .trim()
                        .replace(/\s+/g, ' ');

            }

        }
    );


    // FETCH OFFICE

    fetchOffices();

});
// MARK CARD AS PRINTED

async function markCardAsPrinted(applicantId) {

    if (!applicantId) {

        console.error(
            "Applicant ID မရှိပါ။"
        );

        return false;
    }

    try {

        console.log(
            "Marking card as printed:",
            applicantId
        );

        const response = await fetch(
            markPrintedUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    application_ids: [
                        applicantId
                    ]

                })
            }
        );

        console.log(
            "Mark Printed Status =",
            response.status
        );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Mark Printed Error:",
                errorText
            );

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const result =
            await response.json();

        console.log(
            "Mark Printed Result:",
            result
        );


        // SUCCESS ALERT

        if (typeof showAppAlert === "function") {

            showAppAlert({

                title:
                    "ပုံနှိပ်ခြင်း အောင်မြင်ပါသည်",

                message:
                    "EID Card ကို ပုံနှိပ်ပြီးပါပြီ။",

                type:
                    "success",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(
                "EID Card ကို ပုံနှိပ်ပြီးပါပြီ။"
            );

        }


        // UPDATE TABLE PRINTED DATE

        updatePrintedDate(
            applicantId
        );

        return true;

    }
    catch (error) {

        console.error(
            "Mark Printed Error:",
            error
        );

        if (typeof showAppAlert === "function") {

            showAppAlert({

                title:
                    "အမှားဖြစ်နေပါသည်",

                message:
                    "Card ကို Printed အဖြစ် မှတ်သား၍ မရပါ။",

                type:
                    "error",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(
                "Card ကို Printed အဖြစ် မှတ်သား၍ မရပါ။"
            );

        }

        return false;
    }
}


// UPDATE PRINTED DATE

function updatePrintedDate(applicantId) {

    const button =
        document.querySelector(
            `.preview-card-btn[data-applicant-id="${applicantId}"]`
        );

    if (!button) {

        console.warn(
            "Applicant button not found:",
            applicantId
        );

        return;
    }

    const row =
        button.closest("tr");

    if (!row) {

        return;
    }


    const printedDateCell =
        row.children[5];

    if (!printedDateCell) {

        return;
    }

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    printedDateCell.textContent =
        `${year}-${month}-${day}`;
}


// FETCH OFFICE

async function fetchOffices() {

    try {

        const response =
            await fetch(
                '/Home/GetOffices'
            );

        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const data =
            await response.json();

        const officeSelect =
            $('#officeSelect');

        officeSelect.empty();

        officeSelect.append(
            new Option(
                '-- Office Stations ရွေးပါ --',
                ''
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
                '-- Office Stations ရွေးပါ --',

            allowClear:
                true,

            width:
                '100%'

        });

    }
    catch (error) {

        console.error(
            "Office API Error:",
            error
        );

    }
}


// CARD PREVIEW

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // GET ELEMENTS

        const modal =
            document.getElementById(
                "cardPreviewModal"
            );

        const modalContent =
            document.getElementById(
                "cardPreviewContent"
            );

        const closeBtn =
            document.getElementById(
                "closeCardPreview"
            );

        const printBtn =
            document.getElementById(
                "printCardBtn"
            );


        // CHECK ELEMENTS

        if (!modal || !modalContent) {

            console.warn(
                "Card Preview elements not found."
            );

            return;
        }


        // CURRENT APPLICANT

        let currentApplicantId =
            null;

        let currentUid =
            null;

        let currentOfficeCode =
            null;


        // PRINT STATE

        let isPrinting =
            false;

        let printStarted =
            false;

        let printFinished =
            false;

        let printStartTime =
            0;


        // OPEN CARD PREVIEW

        document.addEventListener(
            "click",
            async function (e) {

                const button =
                    e.target.closest(
                        ".preview-card-btn"
                    );

                if (!button) {

                    return;
                }

                e.preventDefault();


                // GET APPLICANT DATA

                currentApplicantId =
                    button.dataset.applicantId;

                currentUid =
                    button.dataset.uid;

                currentOfficeCode =
                    button.dataset.officeCode || "";



                // RESET PRINT STATE

                isPrinting =
                    false;

                printStarted =
                    false;

                printFinished =
                    false;

                printStartTime =
                    0;


                // API URL

                const url =
                    `/CardPrint/EIDCardPrint` +
                    `?applicantId=${encodeURIComponent(currentApplicantId)}` +
                    `&uid=${encodeURIComponent(currentUid)}` +
                    `&officeCode=${encodeURIComponent(currentOfficeCode)}`;


                // SHOW MODAL

                modal.classList.add(
                    "preview-show"
                );

                document.body.classList.add(
                    "preview-body-lock"
                );


                // LOADING

                modalContent.innerHTML = `

                    <div class="preview-loading">

                        <div
                            class="spinner-border text-primary"
                            role="status">
                        </div>

                        <span class="mt-2">
                            Loading Card...
                        </span>

                    </div>

                `;

                // DISABLE PRINT BUTTON

                if (printBtn) {

                    printBtn.disabled =
                        true;

                }


                // LOAD CARD

                try {

                    const response =
                        await fetch(url);

                    if (!response.ok) {

                        throw new Error(
                            `HTTP Error: ${response.status}`
                        );

                    }

                    const html =
                        await response.text();


                    // PARSE HTML

                    const parser =
                        new DOMParser();

                    const doc =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );


                    // FIND CARD

                    const card =
                        doc.querySelector(
                            ".nrc-wrapper"
                        );

                    if (!card) {

                        throw new Error(
                            "nrc-wrapper မတွေ့ပါ။"
                        );

                    }

                    // SHOW CARD

                    modalContent.innerHTML =
                        "";

                    modalContent.appendChild(
                        card.cloneNode(true)
                    );


                    // ENABLE PRINT BUTTON

                    if (printBtn) {

                        printBtn.disabled =
                            false;

                    }

                    console.log(
                        "Card loaded successfully."
                    );

                }
                catch (error) {

                    console.error(
                        "Preview Error:",
                        error
                    );

                    modalContent.innerHTML = `

                        <div
                            class="text-danger text-center">

                            <i class="
                                fa-solid
                                fa-circle-exclamation
                                fs-2">
                            </i>

                            <div class="mt-2 fw-bold">

                                Card Loading Failed

                            </div>

                            <div class="small mt-1">

                                ${error.message}

                            </div>

                        </div>

                    `;

                    if (printBtn) {

                        printBtn.disabled =
                            true;

                    }

                }

            }
        );

        // PRINT CARD

        if (printBtn) {

            printBtn.addEventListener(
                "click",
                function () {

                    console.log(
                        "PRINT CARD CLICKED"
                    );


                    // CHECK APPLICANT

                    if (!currentApplicantId) {

                        alert(
                            "Applicant ID မရှိပါ။"
                        );

                        return;
                    }


                    // CHECK CARD

                    const card =
                        document.querySelector(
                            "#cardPreviewContent .nrc-wrapper"
                        );

                    if (!card) {

                        alert(
                            "Card မတွေ့ပါ။"
                        );

                        return;
                    }


                    // PREVENT DOUBLE PRINT

                    if (isPrinting) {

                        console.warn(
                            "Print process already running."
                        );

                        return;
                    }


                    // RESET PRINT STATE

                    isPrinting =
                        true;

                    printStarted =
                        false;

                    printFinished =
                        false;

                    printStartTime =
                        Date.now();


                    // ADD PRINTING CLASS

                    document.body.classList.add(
                        "printing-card"
                    );


                    // DISABLE PRINT BUTTON

                    printBtn.disabled =
                        true;

                    // PRINT MEDIA QUERY

                    const mediaQueryList =
                        window.matchMedia(
                            "print"
                        );


                    // PRINT START

                    function handleBeforePrint() {

                        console.log(
                            "Print dialog / print process started."
                        );

                        printStarted =
                            true;
                    }

                    // PRINT END / CANCEL

                    function handleAfterPrint() {

                        if (printFinished) {

                            return;
                        }

                        printFinished =
                            true;


                        console.log(
                            "Print dialog closed."
                        );

                        // REMOVE PRINTING CLASS

                        document.body.classList.remove(
                            "printing-card"
                        );


                        // REMOVE MEDIA LISTENER

                        if (
                            mediaQueryList.removeEventListener
                        ) {

                            mediaQueryList.removeEventListener(
                                "change",
                                handlePrintMediaChange
                            );

                        }
                        else {

                            mediaQueryList.removeListener(
                                handlePrintMediaChange
                            );

                        }



                        const printDuration =
                            Date.now() -
                            printStartTime;


                        console.log(
                            "Print duration:",
                            printDuration,
                            "ms"
                        );


                        // RESTORE BUTTON

                        if (printBtn) {

                            printBtn.disabled =
                                false;

                        }


                        isPrinting =
                            false;

                    }


                    // MEDIA QUERY CHANGE

                    function handlePrintMediaChange(e) {

                        console.log(
                            "Print media change:",
                            e.matches
                        );


                        if (e.matches) {

                            handleBeforePrint();

                        }
                        else {

                            handleAfterPrint();

                        }

                    }


                    // ADD PRINT LISTENER

                    if (
                        mediaQueryList.addEventListener
                    ) {

                        mediaQueryList.addEventListener(
                            "change",
                            handlePrintMediaChange
                        );

                    }
                    else {

                        mediaQueryList.addListener(
                            handlePrintMediaChange
                        );

                    }


                    // BEFORE PRINT

                    window.addEventListener(
                        "beforeprint",
                        handleBeforePrint
                    );


                    // AFTER PRINT

                    window.addEventListener(
                        "afterprint",
                        handleAfterPrint,
                        {
                            once: true
                        }
                    );

                    // OPEN WINDOWS PRINT DIALOG

                    setTimeout(
                        function () {

                            console.log(
                                "Opening browser print dialog..."
                            );

                            window.print();

                        },
                        300
                    );

                }
            );

        }


        // CLOSE BUTTON

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closePreview
            );

        }


        // CLICK OUTSIDE MODAL

        modal.addEventListener(
            "click",
            function (e) {

                if (
                    e.target === modal
                ) {

                    closePreview();

                }

            }
        );


        // ESC KEY

        document.addEventListener(
            "keydown",
            function (e) {

                if (
                    e.key === "Escape" &&
                    modal.classList.contains(
                        "preview-show"
                    )
                ) {

                    closePreview();

                }

            }
        );


        // CLOSE PREVIEW

        function closePreview() {

            // DON'T CLOSE WHILE PRINTING

            if (isPrinting) {

                console.warn(
                    "Print process is still running."
                );

                return;
            }


            // CLOSE MODAL

            modal.classList.remove(
                "preview-show"
            );

            document.body.classList.remove(
                "preview-body-lock"
            );


            // RESET CONTENT

            setTimeout(
                function () {

                    if (
                        !modal.classList.contains(
                            "preview-show"
                        )
                    ) {

                        modalContent.innerHTML = `

                            <div class="preview-loading">

                                <div
                                    class="spinner-border
                                           text-primary"
                                    role="status">
                                </div>

                                <span class="mt-2">
                                    Loading Card...
                                </span>

                            </div>

                        `;

                    }

                },
                300
            );


            // RESET CURRENT APPLICANT

            currentApplicantId =
                null;

            currentUid =
                null;

            currentOfficeCode =
                null;


            // RESET PRINT STATE

            isPrinting =
                false;

            printStarted =
                false;

            printFinished =
                false;

            printStartTime =
                0;


            // DISABLE PRINT BUTTON

            if (printBtn) {

                printBtn.disabled =
                    true;

            }

        }

    }
);

//print xml
// ============================================
// GENERATE XML
// ============================================

async function submitPrint() {

    console.log("========== XML GENERATE START ==========");

    // --------------------------------------------
    // GET CHECKED CHECKBOXES
    // --------------------------------------------

    const checkboxes = Array.from(
        document.querySelectorAll(
            ".applicant-checkbox:checked"
        )
    );

    console.log(
        "Selected checkbox count:",
        checkboxes.length
    );


    // --------------------------------------------
    // NO SELECTION
    // --------------------------------------------

    if (checkboxes.length === 0) {

        if (typeof showAppAlert === "function") {

            showAppAlert({
                title: "သတိပေးချက်",
                message:
                    "XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။",
                type: "warning",
                confirmText: "OK",
                showCancel: false
            });

        } else {

            alert(
                "XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။"
            );
        }

        return;
    }


    // --------------------------------------------
    // GET DATA FROM EACH ROW
    // --------------------------------------------

    const selectedRows = checkboxes
        .map(function (checkbox) {

            const row = checkbox.closest("tr");

            if (!row) {

                console.warn(
                    "Checkbox row not found:",
                    checkbox
                );

                return null;
            }


            // IMPORTANT:
            // First priority = data-* attribute
            // Second priority = checkbox value

            const applicantId =
                checkbox.dataset.applicantId ||
                checkbox.getAttribute("data-applicant-id") ||
                checkbox.value ||
                "";


            const uid =
                checkbox.dataset.uid ||
                checkbox.getAttribute("data-uid") ||
                "";


            const officeCode =
                checkbox.dataset.officeCode ||
                checkbox.getAttribute("data-office-code") ||
                "";


            return {

                applicantId:
                    applicantId.trim(),

                uid:
                    uid.trim(),

                officeCode:
                    officeCode.trim(),

                row:
                    row
            };

        })
        .filter(function (item) {

            return item &&
                item.applicantId !== "";

        });


    console.log(
        "Selected Rows:",
        selectedRows
    );


    // --------------------------------------------
    // SHOW EACH ROW DATA
    // --------------------------------------------

    selectedRows.forEach(function (item, index) {

        console.log(
            `Row ${index + 1}:`,
            {
                applicantId:
                    item.applicantId,

                uid:
                    item.uid,

                officeCode:
                    item.officeCode
            }
        );

    });


    // --------------------------------------------
    // NO VALID APPLICANT ID
    // --------------------------------------------

    if (selectedRows.length === 0) {

        if (typeof showAppAlert === "function") {

            showAppAlert({
                title: "သတိပေးချက်",
                message:
                    "ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။",
                type: "warning",
                confirmText: "OK",
                showCancel: false
            });

        } else {

            alert(
                "ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။"
            );
        }

        return;
    }


    // --------------------------------------------
    // PRINT BUTTON
    // --------------------------------------------

    const printButton =
        document.getElementById(
            "generateXmlTopBtn"
        );


    let successCount = 0;

    let failedCount = 0;

    const failedApplicants = [];


    try {

        // ----------------------------------------
        // DISABLE BUTTON
        // ----------------------------------------

        if (printButton) {

            printButton.disabled = true;

            printButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1"></span>
                XML Generate လုပ်နေပါသည်...
            `;
        }


        // ----------------------------------------
        // GENERATE XML ONE BY ONE
        // ----------------------------------------

        for (const item of selectedRows) {

            const applicantId =
                item.applicantId;


            console.log(
                "----------------------------------------"
            );

            console.log(
                "Generating XML for Applicant:",
                applicantId
            );


            try {

                // --------------------------------
                // REQUEST BODY
                // --------------------------------

                const requestBody = {

                    applicationId:
                        applicantId

                };


                console.log(
                    "Request Body:",
                    requestBody
                );


                // --------------------------------
                // POST API
                // --------------------------------

                const response =
                    await fetch(
                        generateXmlUrl,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    requestBody
                                )
                        }
                    );


                console.log(
                    "Applicant:",
                    applicantId,
                    "HTTP Status:",
                    response.status
                );


                // --------------------------------
                // READ RESPONSE
                // --------------------------------

                const responseText =
                    await response.text();


                console.log(
                    "Applicant:",
                    applicantId,
                    "Raw Response:",
                    responseText
                );


                // --------------------------------
                // PARSE JSON
                // --------------------------------

                let result;

                try {

                    result =
                        JSON.parse(
                            responseText
                        );

                }
                catch (jsonError) {

                    console.error(
                        "JSON Parse Error:",
                        applicantId,
                        jsonError
                    );


                    failedCount++;


                    failedApplicants.push({

                        applicantId:
                            applicantId,

                        error:
                            responseText ||
                            "Invalid server response"

                    });


                    continue;
                }


                console.log(
                    "Applicant:",
                    applicantId,
                    "Result:",
                    result
                );


                // --------------------------------
                // SERVER ERROR
                // --------------------------------

                if (
                    !response.ok ||
                    !result.success
                ) {

                    failedCount++;


                    failedApplicants.push({

                        applicantId:
                            applicantId,

                        error:
                            result.message ||
                            `HTTP ${response.status}`

                    });


                    console.error(
                        "XML Generate Failed:",
                        applicantId,
                        result.message
                    );


                    continue;
                }


                // --------------------------------
                // SUCCESS
                // --------------------------------

                successCount++;


                console.log(
                    "XML Generated Successfully:",
                    applicantId
                );


                console.log(
                    "File Name:",
                    result.fileName
                );


                console.log(
                    "File Path:",
                    result.filePath
                );

            }
            catch (error) {

                failedCount++;


                failedApplicants.push({

                    applicantId:
                        applicantId,

                    error:
                        error.message ||
                        "Request failed"

                });


                console.error(
                    "XML Generate Request Error:",
                    applicantId,
                    error
                );
            }
        }


        // --------------------------------------------
        // SUMMARY
        // --------------------------------------------

        console.log(
            "========== XML GENERATE SUMMARY =========="
        );


        console.log({

            total:
                selectedRows.length,

            success:
                successCount,

            failed:
                failedCount,

            failedApplicants:
                failedApplicants

        });


        // --------------------------------------------
        // MESSAGE
        // --------------------------------------------

        let message =
            `${successCount} ယောက်အတွက် XML File Generate ပြုလုပ်ပြီးပါပြီ။`;


        if (successCount > 0) {

            message +=
                " ရှိပြီးသား XML File များရှိပါက Overwrite ပြုလုပ်ထားပါသည်။";

        }


        if (failedCount > 0) {

            message +=
                ` ${failedCount} ယောက်ကို Generate ပြုလုပ်၍ မရပါ။`;


            console.error(
                "Failed Applicants:",
                failedApplicants
            );
        }


        // --------------------------------------------
        // SHOW RESULT
        // --------------------------------------------

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    failedCount === 0
                        ? "အောင်မြင်ပါသည်"
                        : "Generate ပြီးပါပြီ",

                message:
                    message,

                type:
                    failedCount === 0
                        ? "success"
                        : "warning",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(message);

        }

    }
    catch (error) {

        console.error(
            "XML Generate Fatal Error:",
            error
        );


        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    "အမှားဖြစ်နေပါသည်",

                message:
                    error.message ||
                    "XML Generate ပြုလုပ်၍ မရပါ။",

                type:
                    "error",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(
                error.message ||
                "XML Generate ပြုလုပ်၍ မရပါ။"
            );
        }

    }
    finally {

        // ----------------------------------------
        // ENABLE BUTTON
        // ----------------------------------------

        if (printButton) {

            printButton.disabled =
                false;

            printButton.innerHTML = `
                <i class="fa-solid fa-file-code me-1"></i>
                PRINT
            `;
        }

    }


    console.log(
        "========== XML GENERATE END =========="
    );
}
// PRINTED RADIO BUTTON

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const printedRadio =
            document.getElementById(
                "isPrinted"
            );

        if (!printedRadio) {

            return;
        }

        printedRadio.addEventListener(
            "click",
            function () {

                if (
                    this.dataset.checked ===
                    "true"
                ) {

                    this.checked =
                        false;

                    this.dataset.checked =
                        "false";

                }
                else {

                    this.dataset.checked =
                        "true";

                }

            }
        );

    }
);