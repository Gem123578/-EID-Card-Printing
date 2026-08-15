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

        $('#dateRangeType').val(rangeType);

        $('#fromDate').val(
            start.format('YYYY-MM-DD')
        );

        $('#toDate').val(
            end.format('YYYY-MM-DD')
        );

        $('#dateRangeFilter').val(
            start.format('YYYY-MM-DD') +
            ' - ' +
            end.format('YYYY-MM-DD')
        );

        $('#clearDateRange').addClass('show');

    });


    // PAGE LOAD DATE

    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();

    if (fromDate && toDate)
    {

        $('#clearDateRange').addClass('show');

    } else {

        $('#clearDateRange').removeClass('show');

    }


    // CLEAR DATE

    $('#clearDateRange').on('click', function () {

        $('#dateRangeFilter').val('');

        $('#dateRangeType').val('');

        $('#fromDate').val('');

        $('#toDate').val('');

        $(this).removeClass('show');

    });


    // SEARCH

    $('#cardSearchForm').on('submit', function () {

        const searchInput =
            document.getElementById('SearchTerm');

        if (searchInput)
        {

            searchInput.value =searchInput.value.trim().replace(/\s+/g, ' ');

        }

    });

    // FETCH OFFICE


    initSelectAll();
    fetchOffices();

});


// FETCH OFFICE

async function fetchOffices() {

    try
    {

        const response = await fetch('/Home/GetOffices');

        if (!response.ok)
        {

            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        const officeSelect = $('#officeSelect');

        officeSelect.empty();

        officeSelect.append(new Option('-- Office Stations ရွေးပါ --',''));

        data.forEach(function (office)
        {

            officeSelect.append(new Option(office.stationName,office.stationCode));

        });

        officeSelect.select2
            ({
                placeholder: '-- Office Stations ရွေးပါ --',

                allowClear: true,

                width: '100%'
            });

    }
    catch (error) {

        console.error("Office API Error:",error);

    }
}


// GET APPLICANT DATA FROM CHECKBOX

function getApplicantDataFromCheckbox(checkbox) {

    if (!checkbox)
    {
        return null;
    }

    const applicantId =
        (
            checkbox.dataset.applicantId ||
            checkbox.getAttribute("data-applicant-id") ||
            checkbox.value ||
            ""
        ).trim();

    const uid =
        (
            checkbox.dataset.uid ||
            checkbox.getAttribute("data-uid") ||
            ""
        ).trim();

    const officeCode =
        (
            checkbox.dataset.officeCode ||
            checkbox.getAttribute("data-office-code") ||
            ""
        ).trim();

    return {

        applicantId: applicantId,

        uid: uid,

        officeCode: officeCode

    };
}


// GENERATE XML FOR ONE APPLICANT

async function generateXmlForApplicant(
    applicantId,
    uid,
    officeCode
) {

    if (!applicantId) {

        throw new Error(
            "Applicant ID မရှိပါ။"
        );
    }

    const requestBody = {

        applicantId:
            applicantId,

        uid:
            uid || "",

        officeCode:
            officeCode || ""

    };


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


    const responseText =
        await response.text();


    let result;

    try {

        result =
            JSON.parse(
                responseText
            );

    }
    catch (error) {

        throw new Error(
            responseText ||
            "Invalid server response."
        );
    }


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            `HTTP ${response.status}`
        );
    }


    return result;
}


// SHOW XML RESULT

function showXmlResult(
    successCount,
    failedCount,
    failedApplicants
) {

    let message =
        `${successCount} ယောက်အတွက် XML File Generate ပြုလုပ်ပြီးပါပြီ။`;


    if (successCount > 0) {

        message +=
            " ရှိပြီးသား XML File များရှိပါက Overwrite ပြုလုပ်ထားပါသည်။";

    }


    if (failedCount > 0) {

        message +=
            ` ${failedCount} ယောက်ကို Generate ပြုလုပ်၍ မရပါ။`;
    }


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


// TOP BAR PRINT
// CHECKBOX -> GENERATE XML

async function submitPrint() {


    const checkboxes =
        Array.from(
            document.querySelectorAll(
                ".applicant-checkbox:checked"
            )
        );


    // NO SELECTION

    if (
        checkboxes.length === 0
    ) {

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    "သတိပေးချက်",

                message:
                    "XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။",

                type:
                    "warning",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(
                "XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။"
            );

        }

        return;
    }


    // GET SELECTED APPLICANTS

    const selectedRows =
        checkboxes
            .map(function (checkbox) {

                const row =
                    checkbox.closest("tr");

                const data =
                    getApplicantDataFromCheckbox(
                        checkbox
                    );

                if (!data) {
                    return null;
                }

                return {

                    applicantId:
                        data.applicantId,

                    uid:
                        data.uid,

                    officeCode:
                        data.officeCode,

                    row:
                        row

                };

            })
            .filter(function (item) {

                return (
                    item &&
                    item.applicantId
                );

            });


    if (
        selectedRows.length === 0
    ) {

        if (
            typeof showAppAlert === "function"
        ) {

            showAppAlert({

                title:
                    "သတိပေးချက်",

                message:
                    "ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။",

                type:
                    "warning",

                confirmText:
                    "OK",

                showCancel:
                    false

            });

        }
        else {

            alert(
                "ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။"
            );

        }

        return;
    }


    const printButton =
        document.getElementById(
            "generateXmlTopBtn"
        );


    let successCount = 0;

    let failedCount = 0;

    const failedApplicants = [];


    try {

        // DISABLE TOP BUTTON

        if (printButton) {

            printButton.disabled =
                true;

            printButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1"></span>
                XML Generate လုပ်နေပါသည်...
            `;

        }


        // GENERATE ONE BY ONE

        for (
            const item of selectedRows
        ) {

            try {
                const result =
                    await generateXmlForApplicant(

                        item.applicantId,

                        item.uid,

                        item.officeCode

                    );


                successCount++;


            }
            catch (error) {

                failedCount++;


                failedApplicants.push({

                    applicantId:
                        item.applicantId,

                    error:
                        error.message ||
                        "Request failed"

                });

            }

        }


        // SHOW SUMMARY

        showXmlResult(

            successCount,

            failedCount,

            failedApplicants

        );

    }
    catch (error) {


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

        if (printButton) {

            printButton.disabled =
                false;

            printButton.innerHTML = `
                <i class="fa-solid fa-file-code me-1"></i>
                PRINT
            `;

        }

    }
}

// CARD PREVIEW

document.addEventListener(
    "DOMContentLoaded",
    function () {

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
            document.querySelector(
                ".preview-print-button"
            );


        if (
            !modal ||
            !modalContent
        ) {

            console.warn(
                "Card Preview elements not found."
            );

            return;
        }


        // CURRENT PREVIEW APPLICANT

        let currentApplicantId =
            null;

        let currentUid =
            null;

        let currentOfficeCode =
            null;


        // OPEN PREVIEW

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


                // SAVE CURRENT APPLICANT

                currentApplicantId =
                    (
                        button.dataset.applicantId ||
                        ""
                    ).trim();


                currentUid =
                    (
                        button.dataset.uid ||
                        ""
                    ).trim();


                currentOfficeCode =
                    (
                        button.dataset.officeCode ||
                        ""
                    ).trim();

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


                if (printBtn) {

                    printBtn.disabled =
                        true;

                    printBtn.innerHTML = `
                        <i class="fa-solid fa-file-code me-1"></i>
                        PRINT
                    `;

                }


                // BUILD PREVIEW URL

                const url =
                    `/CardPrint/EIDCardPrint` +
                    `?applicantId=${encodeURIComponent(
                        currentApplicantId
                    )}` +
                    `&uid=${encodeURIComponent(
                        currentUid
                    )}` +
                    `&officeCode=${encodeURIComponent(
                        currentOfficeCode
                    )}`;


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


                    const parser =
                        new DOMParser();


                    const doc =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );


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


                    if (printBtn) {

                        printBtn.disabled =
                            false;

                    }

                }
                catch (error) {

                    console.error(
                        "Preview Error:",
                        error
                    );


                    modalContent.innerHTML = `

                        <div class="text-danger text-center">

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


        // PREVIEW CARD BUTTON
        // GENERATE XML ONLY

        if (printBtn) {

            printBtn.addEventListener(
                "click",
                async function () {


                    // CHECK APPLICANT

                    if (
                        !currentApplicantId
                    ) {

                        if (
                            typeof showAppAlert ===
                            "function"
                        ) {

                            showAppAlert({

                                title:
                                    "သတိပေးချက်",

                                message:
                                    "Applicant ID မရှိပါ။",

                                type:
                                    "warning",

                                confirmText:
                                    "OK",

                                showCancel:
                                    false

                            });

                        }
                        else {

                            alert(
                                "Applicant ID မရှိပါ။"
                            );

                        }

                        return;
                    }


                    // PREVENT DOUBLE CLICK

                    if (
                        printBtn.disabled
                    ) {

                        return;
                    }


                    try {

                        // DISABLE BUTTON

                        printBtn.disabled =
                            true;

                        printBtn.innerHTML = `
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            XML Generate လုပ်နေပါသည်...
                        `;



                        // GENERATE XML

                        const result =
                            await generateXmlForApplicant(

                                currentApplicantId,

                                currentUid,

                                currentOfficeCode

                            );

                        // SUCCESS

                        if (
                            typeof showAppAlert ===
                            "function"
                        ) {

                            showAppAlert({

                                title:
                                    "အောင်မြင်ပါသည်",

                                message:
                                    `${currentApplicantId} အတွက် XML File Generate ပြုလုပ်ပြီးပါပြီ။`,

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
                                `${currentApplicantId} အတွက် XML File Generate ပြုလုပ်ပြီးပါပြီ။`
                            );

                        }

                    }
                    catch (error) {

                        console.error(
                            "Preview XML Generate Error:",
                            error
                        );


                        if (
                            typeof showAppAlert ===
                            "function"
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

                        // RESTORE BUTTON

                        printBtn.disabled =
                            false;

                        printBtn.innerHTML = `
                            <i class="fa-solid fa-file-code me-1"></i>
                            PRINT
                        `;

                    }

                }
            );

        }


        // CLOSE

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closePreview
            );

        }


        // CLICK OUTSIDE

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


        // ESC

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

            modal.classList.remove(
                "preview-show"
            );

            document.body.classList.remove(
                "preview-body-lock"
            );


            currentApplicantId =
                null;

            currentUid =
                null;

            currentOfficeCode =
                null;


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
                                    class="spinner-border text-primary"
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


            if (printBtn) {

                printBtn.disabled =
                    true;

                printBtn.innerHTML = `
                    <i class="fa-solid fa-file-code me-1"></i>
                    PRINT
                `;

            }

        }

    }
);

// MARK CARD AS PRINTED

async function markCardAsPrinted(applicantId) {


    try {

        const response =
            await fetch(
                markPrintedUrl,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            application_ids: [
                                applicantId
                            ]

                        })

                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const result =
            await response.json();

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

        return false;

    }

}

// UPDATE PRINTED DATE

function updatePrintedDate(
    applicantId
) {

    const button =
        document.querySelector(
            `.preview-card-btn[data-applicant-id="${CSS.escape(applicantId)}"]`
        );


    if (!button) {

        return;
    }


    const row =
        button.closest("tr");


    if (!row) {

        return;
    }



    const printedDateCell =
        row.children[6];


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


// PRINTED RADIO

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

//Select All

function initSelectAll() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );

    if (!selectAll) {
        return;
    }

    // ALL CHECKBOX CLICK

    selectAll.addEventListener(
        'change',
        function () {

            const checked =
                this.checked;

            const checkboxes =
                document.querySelectorAll(
                    '.applicant-checkbox'
                );

            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        checked;

                }
            );
        }
    );


    // INDIVIDUAL CHECKBOX

    document.addEventListener(
        'change',
        function (e) {

            if (
                !e.target.classList.contains(
                    'applicant-checkbox'
                )
            ) {
                return;
            }

            updateSelectAllState();

        }
    );

}

// UPDATE SELECT ALL STATE

function updateSelectAllState() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );

    if (!selectAll) {
        return;
    }


    const checkboxes =
        Array.from(
            document.querySelectorAll(
                '.applicant-checkbox'
            )
        );


    if (checkboxes.length === 0) {

        selectAll.checked = false;

        selectAll.indeterminate = false;

        return;
    }


    const checkedCount =
        checkboxes.filter(
            function (checkbox) {
                return checkbox.checked;
            }
        ).length;


    if (checkedCount === 0) {

        selectAll.checked = false;

        selectAll.indeterminate = false;

    }
    else if (
        checkedCount === checkboxes.length
    ) {

        selectAll.checked = true;

        selectAll.indeterminate = false;

    }
    else {

        selectAll.checked = false;

        selectAll.indeterminate = true;

    }

}
