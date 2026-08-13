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
// FETCH OFFICE
// =========================================================

async function fetchOffices() {

    try {

        const response =
            await fetch('/Home/GetOffices');

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
        // MARK PRINTED URL
        // =====================================================

        /*
         * IMPORTANT:
         * Change this URL if your controller action
         * uses another route.
         */

        const markPrintedUrl =
            '/CardPrint/MarkAsPrinted';


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


                // ---------------------------------------------
                // Get applicant data
                // ---------------------------------------------

                currentApplicantId =
                    button.dataset.applicantId;

                currentUid =
                    button.dataset.uid;

                currentOfficeCode =
                    button.dataset.officeCode || "";


                // ---------------------------------------------
                // API URL
                // ---------------------------------------------

                const url =
                    `/CardPrint/EIDCardPrint` +
                    `?applicantId=${encodeURIComponent(currentApplicantId)}` +
                    `&uid=${encodeURIComponent(currentUid)}` +
                    `&officeCode=${encodeURIComponent(currentOfficeCode)}`;


                console.log(
                    "Preview URL =",
                    url
                );


                // ---------------------------------------------
                // Show modal
                // ---------------------------------------------

                modal.classList.add(
                    "preview-show"
                );

                document.body.classList.add(
                    "preview-body-lock"
                );


                // ---------------------------------------------
                // Loading
                // ---------------------------------------------

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


                // ---------------------------------------------
                // Load card
                // ---------------------------------------------

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


                    // -----------------------------------------
                    // Parse HTML
                    // -----------------------------------------

                    const parser =
                        new DOMParser();

                    const doc =
                        parser.parseFromString(
                            html,
                            "text/html"
                        );


                    // -----------------------------------------
                    // Find card
                    // -----------------------------------------

                    const card =
                        doc.querySelector(
                            ".nrc-wrapper"
                        );


                    if (!card) {

                        throw new Error(
                            "nrc-wrapper မတွေ့ပါ။"
                        );

                    }


                    // -----------------------------------------
                    // Show card
                    // -----------------------------------------

                    modalContent.innerHTML = "";

                    modalContent.appendChild(
                        card.cloneNode(true)
                    );


                    // -----------------------------------------
                    // Enable print
                    // -----------------------------------------

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

                        <div class="text-danger text-center">

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


                    // -----------------------------------------
                    // Get card
                    // -----------------------------------------

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


                    // -----------------------------------------
                    // Check applicant
                    // -----------------------------------------

                    if (!currentApplicantId) {

                        alert(
                            "Applicant ID not found."
                        );

                        return;
                    }


                    // -----------------------------------------
                    // Open print window
                    // -----------------------------------------

                    const printWindow =
                        window.open(
                            "",
                            "_blank",
                            "width=1000,height=800"
                        );


                    if (!printWindow) {

                        alert(
                            "Popup Blocked. Please allow popups."
                        );

                        return;
                    }


                    // -----------------------------------------
                    // Get CSS files
                    // -----------------------------------------

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


                    // -----------------------------------------
                    // Write print page
                    // -----------------------------------------

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


                    // -----------------------------------------
                    // Wait for print window
                    // -----------------------------------------

                    setTimeout(
                        function () {

                            printWindow.focus();

                            printWindow.print();


                            /*
                             * afterprint fires when the user
                             * finishes/cancels the browser
                             * print dialog.
                             */

                            printWindow.onafterprint =
                                async function () {

                                    console.log(
                                        "PRINT DIALOG CLOSED"
                                    );


                                    /*
                                     * Mark as printed ONLY
                                     * after print dialog closes.
                                     */

                                    await markCardAsPrinted(
                                        currentApplicantId
                                    );


                                    /*
                                     * Close print window
                                     */

                                    printWindow.close();

                                };

                        },
                        1000
                    );

                }
            );

        }


        // =====================================================
        // MARK CARD AS PRINTED
        // =====================================================

        async function markCardAsPrinted(
            applicantId
        ) {

            if (!applicantId) {

                console.error(
                    "Applicant ID is missing."
                );

                return;
            }


            try {

                console.log(
                    "Marking card as printed:",
                    applicantId
                );


                const response =
                    await fetch(
                        markPrintedUrl,
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

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


                // ---------------------------------------------
                // Success message
                // ---------------------------------------------

                if (typeof showAppAlert === "function") {

                    showAppAlert({

                        title:
                            "Print Successful",

                        message:
                            "The card has been printed successfully.",

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
                        "The card has been printed successfully."
                    );

                }


                // ---------------------------------------------
                // Optional:
                // Update Printed Date in table
                // ---------------------------------------------

                updatePrintedDate(
                    applicantId
                );

            }
            catch (error) {

                console.error(
                    "Mark Printed Error:",
                    error
                );


                if (typeof showAppAlert === "function") {

                    showAppAlert({

                        title:
                            "Print Status Error",

                        message:
                            "Card was printed, but the printed status could not be updated.",

                        type:
                            "error",

                        confirmText:
                            "OK",

                        showCancel:
                            false

                    });

                }

            }

        }


        // =====================================================
        // UPDATE PRINTED DATE IN TABLE
        // =====================================================

        function updatePrintedDate(
            applicantId
        ) {

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


            /*
             * Table columns:
             *
             * 0 = UID
             * 1 = Name
             * 2 = NRC
             * 3 = Gender
             * 4 = DOB
             * 5 = Printed Date
             * 6 = Action
             */

            const printedDateCell =
                row.cells[5];


            if (printedDateCell) {

                const today =
                    new Date();

                const date =
                    today.getFullYear() +
                    "-" +
                    String(
                        today.getMonth() + 1
                    ).padStart(2, "0") +
                    "-" +
                    String(
                        today.getDate()
                    ).padStart(2, "0");


                printedDateCell.textContent =
                    date;

            }

        }


        // =====================================================
        // CLOSE
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


            currentApplicantId = null;
            currentUid = null;
            currentOfficeCode = null;


            if (printBtn) {

                printBtn.disabled = true;

            }

        }

    }
);