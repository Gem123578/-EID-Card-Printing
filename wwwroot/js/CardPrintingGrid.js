$(document).ready(function () {

    // =========================================================
    // DATE RANGE
    // =========================================================

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

    });


    // =========================================================
    // CLEAR DATE
    // =========================================================

    $('#clearDateRange').on('click', function () {

        $('#dateRangeFilter').val('');
        $('#dateRangeType').val('');
        $('#fromDate').val('');
        $('#toDate').val('');

    });


    // =========================================================
    // SEARCH
    // =========================================================

    $('#cardSearchForm').on('submit', function () {

        const searchInput =
            document.getElementById('SearchTerm');

        if (searchInput) {

            searchInput.value =
                searchInput.value
                    .trim()
                    .replace(/\s+/g, ' ');

        }

    });


    // =========================================================
    // OFFICE
    // =========================================================

    fetchOffices();

});


// =========================================================
// MARK CARD AS PRINTED
// =========================================================

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


        // =====================================================
        // SUCCESS ALERT
        // =====================================================

        if (typeof showAppAlert === "function") {

            showAppAlert({

                title: "ပုံနှိပ်ခြင်း အောင်မြင်ပါသည်",

                message:
                    "EID Card ကို ပုံနှိပ်ပြီးပါပြီ။",

                type: "success",

                confirmText: "OK",

                showCancel: false

            });

        }
        else {

            alert(
                "EID Card ကို ပုံနှိပ်ပြီးပါပြီ။"
            );

        }


        // =====================================================
        // UPDATE PRINTED DATE IN TABLE
        // =====================================================

        updatePrintedDate(applicantId);


        return true;

    }
    catch (error) {

        console.error(
            "Mark Printed Error:",
            error
        );

        if (typeof showAppAlert === "function") {

            showAppAlert({

                title: "အမှားဖြစ်နေပါသည်",

                message:
                    "Card ကို Printed အဖြစ် မှတ်သား၍ မရပါ။",

                type: "error",

                confirmText: "OK",

                showCancel: false

            });

        }

        return false;
    }
}


// =========================================================
// UPDATE PRINTED DATE IN TABLE
// =========================================================

function updatePrintedDate(applicantId) {

    const button =
        document.querySelector(
            `.preview-card-btn[data-applicant-id="${applicantId}"]`
        );

    if (!button) {
        return;
    }


    const row =
        button.closest("tr");

    if (!row) {
        return;
    }


    // Printed Date column
    // UId = 0
    // Name = 1
    // NRC = 2
    // Gender = 3
    // DOB = 4
    // Printed Date = 5

    const printedDateCell =
        row.children[5];

    if (printedDateCell) {

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
}


// =========================================================
// FETCH OFFICE
// =========================================================

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

            allowClear: true,

            width: '100%'

        });

    }
    catch (error) {

        console.error(
            "Office API Error:",
            error
        );

    }
}


// =========================================================
// CARD PREVIEW
// =========================================================

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
            document.getElementById(
                "printCardBtn"
            );


        if (!modal || !modalContent) {

            console.warn(
                "Card Preview elements not found."
            );

            return;
        }


        // =====================================================
        // CURRENT APPLICANT
        // =====================================================

        let currentApplicantId = null;
        let currentUid = null;
        let currentOfficeCode = null;


        // =====================================================
        // OPEN CARD PREVIEW
        // =====================================================

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


                // -------------------------------------------------
                // GET APPLICANT DATA
                // -------------------------------------------------

                currentApplicantId =
                    button.dataset.applicantId;

                currentUid =
                    button.dataset.uid;

                currentOfficeCode =
                    button.dataset.officeCode || "";


                console.log(
                    "Applicant ID =",
                    currentApplicantId
                );


                // -------------------------------------------------
                // API URL
                // -------------------------------------------------

                const url =
                    `/CardPrint/EIDCardPrint` +
                    `?applicantId=${encodeURIComponent(currentApplicantId)}` +
                    `&uid=${encodeURIComponent(currentUid)}` +
                    `&officeCode=${encodeURIComponent(currentOfficeCode)}`;


                console.log(
                    "Preview URL =",
                    url
                );


                // -------------------------------------------------
                // SHOW MODAL
                // -------------------------------------------------

                modal.classList.add(
                    "preview-show"
                );


                document.body.classList.add(
                    "preview-body-lock"
                );


                // -------------------------------------------------
                // LOADING
                // -------------------------------------------------

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

                    printBtn.disabled = true;

                }


                // -------------------------------------------------
                // LOAD CARD
                // -------------------------------------------------

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


                    // -------------------------------------------------
                    // PARSE HTML
                    // -------------------------------------------------

                    const parser =
                        new DOMParser();


                    const doc =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );


                    // -------------------------------------------------
                    // FIND CARD
                    // -------------------------------------------------

                    const card =
                        doc.querySelector(
                            ".nrc-wrapper"
                        );


                    if (!card) {

                        throw new Error(
                            "nrc-wrapper မတွေ့ပါ။"
                        );

                    }


                    // -------------------------------------------------
                    // SHOW CARD
                    // -------------------------------------------------

                    modalContent.innerHTML = "";


                    modalContent.appendChild(
                        card.cloneNode(true)
                    );


                    // -------------------------------------------------
                    // ENABLE PRINT BUTTON
                    // -------------------------------------------------

                    if (printBtn) {

                        printBtn.disabled = false;

                    }

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

                        </div>

                    `;

                }

            }
        );


        // =====================================================
        // PRINT CARD
        // =====================================================

        if (printBtn) {

            printBtn.addEventListener(
                "click",
                function () {

                    console.log(
                        "PRINT BUTTON CLICKED"
                    );


                    // -------------------------------------------------
                    // CHECK APPLICANT
                    // -------------------------------------------------

                    if (!currentApplicantId) {

                        alert(
                            "Applicant ID မရှိပါ။"
                        );

                        return;
                    }


                    // -------------------------------------------------
                    // GET CARD
                    // -------------------------------------------------

                    const card =
                        document.querySelector(
                            "#cardPreviewContent .nrc-wrapper"
                        );


                    if (!card) {

                        alert(
                            "No card to print"
                        );

                        return;
                    }


                    // -------------------------------------------------
                    // OPEN PRINT WINDOW
                    // -------------------------------------------------

                    const printWindow =
                        window.open(
                            "",
                            "_blank",
                            "width=1000,height=800"
                        );


                    if (!printWindow) {

                        alert(
                            "Popup Block ဖြစ်နေပါသည်။ Browser popup ကို Allow လုပ်ပါ။"
                        );

                        return;
                    }


                    // -------------------------------------------------
                    // GET CSS
                    // -------------------------------------------------

                    const styles =
                        Array.from(
                            document.querySelectorAll(
                                'link[rel="stylesheet"]'
                            )
                        )
                            .map(function (link) {

                                return `
                                <link
                                    rel="stylesheet"
                                    href="${link.href}">
                            `;

                            })
                            .join("");


                    // -------------------------------------------------
                    // PRINT HTML
                    // -------------------------------------------------

                    printWindow.document.open();


                    printWindow.document.write(`

                        <!DOCTYPE html>

                        <html>

                        <head>

                            <meta charset="UTF-8">

                            <title>
                                EID Card Print
                            </title>

                            ${styles}

                            <style>

                                @page {

                                    size:
                                        85.6mm 54mm;

                                    margin: 0;

                                }


                                html,
                                body {

                                    width:
                                        85.6mm;

                                    height:
                                        54mm;

                                    margin: 0;

                                    padding: 0;

                                    background: #fff;

                                }


                                body {

                                    display: flex;

                                    align-items:
                                        flex-start;

                                    justify-content:
                                        flex-start;

                                }


                                .nrc-wrapper {

                                    width:
                                        85.6mm !important;

                                    height:
                                        54mm !important;

                                    margin: 0 !important;

                                    padding: 2.5mm;

                                    box-shadow:
                                        none !important;

                                    page-break-after:
                                        avoid;

                                    page-break-inside:
                                        avoid;

                                }


                                @media print {

                                    html,
                                    body {

                                        width:
                                            85.6mm;

                                        height:
                                            54mm;

                                        margin: 0;

                                        padding: 0;

                                    }


                                    .nrc-wrapper {

                                        box-shadow:
                                            none !important;

                                    }

                                }

                            </style>

                        </head>


                        <body>

                            ${card.outerHTML}

                        </body>

                        </html>

                    `);


                    printWindow.document.close();


                    // =================================================
                    // WAIT THEN PRINT
                    // =================================================

                    setTimeout(
                        function () {

                            printWindow.focus();

                            printWindow.print();


                            // =================================================
                            // PRINT ပြီးမှ Mark As Printed
                            // =================================================

                            let printHandled = false;


                            function printFinished() {

                                if (printHandled) {
                                    return;
                                }


                                printHandled = true;


                                console.log(
                                    "Print finished."
                                );


                                // Close print window
                                try {

                                    printWindow.close();

                                }
                                catch (e) {

                                    console.warn(
                                        "Print window close error:",
                                        e
                                    );

                                }


                                // -------------------------------------------------
                                // MARK AS PRINTED
                                // -------------------------------------------------

                                markCardAsPrinted(
                                    currentApplicantId
                                );

                            }


                            // Browser afterprint
                            printWindow.addEventListener(
                                "afterprint",
                                printFinished
                            );


                            // Fallback
                            // Browser တချို့မှာ afterprint မရနိုင်ပါ
                            setTimeout(
                                function () {

                                    printFinished();

                                },
                                1500
                            );


                        },
                        1000
                    );

                }
            );

        }


        // =====================================================
        // CLOSE BUTTON
        // =====================================================

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closePreview
            );

        }


        // =====================================================
        // CLOSE OUTSIDE
        // =====================================================

        modal.addEventListener(
            "click",
            function (e) {

                if (e.target === modal) {

                    closePreview();

                }

            }
        );


        // =====================================================
        // ESC
        // =====================================================

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


        // =====================================================
        // CLOSE PREVIEW
        // =====================================================

        function closePreview() {

            modal.classList.remove(
                "preview-show"
            );


            document.body.classList.remove(
                "preview-body-lock"
            );


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


            currentApplicantId = null;
            currentUid = null;
            currentOfficeCode = null;


            if (printBtn) {

                printBtn.disabled = true;

            }

        }

    }
);

document.addEventListener("DOMContentLoaded", function () {

    const printedRadio = document.getElementById("isPrinted");

    if (!printedRadio) return;

    printedRadio.addEventListener("click", function () {

        if (this.dataset.checked === "true") {

            this.checked = false;
            this.dataset.checked = "false";

        } else {

            this.dataset.checked = "true";

        }

    });

});