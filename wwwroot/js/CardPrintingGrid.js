let cardTable = null;


// ============================================================
// DOCUMENT READY
// ============================================================

$(document).ready(function () {

    // Initialize DataTable first
    initCardDataTable();

    // Initialize select all
    initSelectAll();

    // Date Range
    initDateRange();

    // Search form
    initSearchForm();

    // Load offices
    fetchOffices();

});


// ============================================================
// DATATABLE
// ============================================================

function initCardDataTable() {

    const table = $('#cardTable');

    if (!table.length) {
        return;
    }

    // Prevent duplicate initialization
    if ($.fn.DataTable.isDataTable('#cardTable')) {
        cardTable = table.DataTable();
        return;
    }

    cardTable = table.DataTable({

        /*
         * IMPORTANT
         *
         * MVC already handles pagination.
         * Therefore DataTables pagination is disabled.
         */
        paging: false,

        searching: false,

        ordering: true,

        info: false,

        lengthChange: false,

        autoWidth: false,

        responsive: false,

        order: [
            [1, 'asc']
        ],

        columnDefs: [

            // Checkbox column
            {
                targets: 0,
                orderable: false,
                searchable: false,
                className: 'text-center'
            },

            // Action column
            {
                targets: 7,
                orderable: false,
                searchable: false,
                className: 'text-center'
            }

        ],

        language: {

            search: "Search:",

            zeroRecords:
                "No matching applicants found.",

            emptyTable:
                "No applicants available."

        },

        drawCallback: function () {

            updateSelectAllState();

        }

    });

}


// ============================================================
// DATE RANGE
// ============================================================

function initDateRange() {

    const dateFilter = $('#dateRangeFilter');

    if (!dateFilter.length) {
        return;
    }


    dateFilter.daterangepicker({

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


        $('#dateRangeType')
            .val(rangeType);


        $('#fromDate')
            .val(
                start.format('YYYY-MM-DD')
            );


        $('#toDate')
            .val(
                end.format('YYYY-MM-DD')
            );


        $('#dateRangeFilter')
            .val(
                start.format('YYYY-MM-DD') +
                ' - ' +
                end.format('YYYY-MM-DD')
            );


        $('#clearDateRange')
            .addClass('show');

    });


    // ========================================================
    // AUTO SELECT TODAY
    // ========================================================

    const fromDate =
        $('#fromDate').val();

    const toDate =
        $('#toDate').val();


    // Server မှ Date မပါလာရင် Today ကို Auto Select
    if (!fromDate && !toDate) {

        const today =
            moment().format('YYYY-MM-DD');


        $('#dateRangeFilter')
            .val(
                today + ' - ' + today
            );


        $('#dateRangeType')
            .val('today');


        $('#fromDate')
            .val(today);


        $('#toDate')
            .val(today);


        $('#clearDateRange')
            .addClass('show');

    }
    else {

        // Server က Date ပြန်ပေးထားရင် အဲဒီ Date ကိုပဲပြမယ်

        if (fromDate && toDate) {

            $('#dateRangeFilter')
                .val(
                    fromDate +
                    ' - ' +
                    toDate
                );

            $('#clearDateRange')
                .addClass('show');

        }

    }


    // ========================================================
    // CLEAR DATE
    // ========================================================

    $('#clearDateRange')
        .on('click', function () {

            $('#dateRangeFilter')
                .val('');

            $('#dateRangeType')
                .val('');

            $('#fromDate')
                .val('');

            $('#toDate')
                .val('');

            $(this)
                .removeClass('show');

        });

}


// ============================================================
// SEARCH FORM
// ============================================================

function initSearchForm() {

    $('#cardSearchForm')
        .on('submit', function () {

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

        });

}


// ============================================================
// FETCH OFFICES
// ============================================================

async function fetchOffices() {

    const officeSelect =
        $('#officeSelect');

    try {

        // Get selected OfficeCode from URL
        const urlParams =
            new URLSearchParams(
                window.location.search
            );

        const selectedOfficeCode =
            urlParams.get('OfficeCode') || '';


        // Hide until data is ready
        officeSelect
            .css('visibility', 'hidden');


        const response =
            await fetch('/Home/GetOffices');


        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        // Clear existing options
        officeSelect.empty();


        // Default option
        officeSelect.append(
            new Option(
                '-- Office Stations ရွေးပါ --',
                ''
            )
        );


        // Add offices
        data.forEach(function (office) {

            officeSelect.append(
                new Option(
                    office.stationName,
                    office.stationCode
                )
            );

        });


        // Initialize Select2
        officeSelect.select2({

            placeholder:
                '-- Office Stations ရွေးပါ --',

            allowClear: false,

            width: '100%'

        });


        // Restore selected Office
        if (selectedOfficeCode) {

            officeSelect
                .val(selectedOfficeCode)
                .trigger('change');

        }


        // Show only after everything is ready
        officeSelect
            .css('visibility', 'visible');


    }
    catch (error) {

        console.error(
            'Office API Error:',
            error
        );

        // Show select even if API fails
        officeSelect
            .css('visibility', 'visible');

    }

}

// ============================================================
// GET APPLICANT DATA
// ============================================================

function getApplicantDataFromCheckbox(
    checkbox
) {

    if (!checkbox) {
        return null;
    }


    const applicantId =
        (
            checkbox.dataset.applicantId ||
            checkbox.getAttribute(
                'data-applicant-id'
            ) ||
            checkbox.value ||
            ''
        ).trim();


    const uid =
        (
            checkbox.dataset.uid ||
            checkbox.getAttribute(
                'data-uid'
            ) ||
            ''
        ).trim();


    const officeCode =
        (
            checkbox.dataset.officeCode ||
            checkbox.getAttribute(
                'data-office-code'
            ) ||
            ''
        ).trim();


    return {

        applicantId:
            applicantId,

        uid:
            uid,

        officeCode:
            officeCode

    };

}


// ============================================================
// GET SELECTED APPLICANTS
// ============================================================

function getSelectedApplicants() {

    const selectedApplicants = [];


    /*
     * IMPORTANT:
     *
     * Use DataTables rows instead of
     * document.querySelectorAll().
     */
    if (cardTable) {

        cardTable
            .rows()
            .nodes()
            .to$()
            .find(
                '.applicant-checkbox:checked'
            )
            .each(function () {

                const data =
                    getApplicantDataFromCheckbox(
                        this
                    );


                if (
                    data &&
                    data.applicantId
                ) {

                    selectedApplicants.push(
                        data
                    );

                }

            });

    }
    else {

        // Fallback
        document
            .querySelectorAll(
                '.applicant-checkbox:checked'
            )
            .forEach(function (checkbox) {

                const data =
                    getApplicantDataFromCheckbox(
                        checkbox
                    );


                if (
                    data &&
                    data.applicantId
                ) {

                    selectedApplicants.push(
                        data
                    );

                }

            });

    }


    return selectedApplicants;

}


// ============================================================
// SELECT ALL
// ============================================================

function initSelectAll() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );


    if (!selectAll) {
        return;
    }


    // Select all

    $(document)
        .off(
            'change.cardSelectAll',
            '#selectAllApplicants'
        )
        .on(
            'change.cardSelectAll',
            '#selectAllApplicants',
            function () {

                const checked =
                    this.checked;


                if (cardTable) {

                    cardTable
                        .rows()
                        .nodes()
                        .to$()
                        .find(
                            '.applicant-checkbox'
                        )
                        .prop(
                            'checked',
                            checked
                        );

                }
                else {

                    document
                        .querySelectorAll(
                            '.applicant-checkbox'
                        )
                        .forEach(
                            function (
                                checkbox
                            ) {

                                checkbox.checked =
                                    checked;

                            }
                        );

                }


                updateSelectAllState();

            }
        );


    // Individual checkbox

    $('#cardTable tbody')
        .off(
            'change.cardCheckbox',
            '.applicant-checkbox'
        )
        .on(
            'change.cardCheckbox',
            '.applicant-checkbox',
            function () {

                updateSelectAllState();

            }
        );


    // DataTable redraw

    $('#cardTable')
        .off('draw.dt.cardCheckbox')
        .on(
            'draw.dt.cardCheckbox',
            function () {

                updateSelectAllState();

            }
        );

}


// ============================================================
// UPDATE SELECT ALL STATE
// ============================================================

function updateSelectAllState() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );


    if (!selectAll) {
        return;
    }


    let checkboxes;


    if (cardTable) {

        checkboxes =
            cardTable
                .rows()
                .nodes()
                .to$()
                .find(
                    '.applicant-checkbox'
                );

    }
    else {

        checkboxes =
            $('.applicant-checkbox');

    }


    const total =
        checkboxes.length;


    const checked =
        checkboxes.filter(
            ':checked'
        ).length;


    if (total === 0) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

        return;

    }


    if (checked === 0) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

    }
    else if (checked === total) {

        selectAll.checked =
            true;

        selectAll.indeterminate =
            false;

    }
    else {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            true;

    }

}


// ============================================================
// SERVER ERROR
// ============================================================

async function getServerErrorMessage(
    response
) {

    let responseText = '';


    try {

        responseText =
            await response.text();

    }
    catch {

        return `HTTP ${response.status}`;

    }


    if (!responseText) {

        return `HTTP ${response.status}`;

    }


    // JSON

    try {

        const json =
            JSON.parse(responseText);


        if (json) {

            return (
                json.message ||
                json.Message ||
                json.error ||
                json.Error ||
                json.title ||
                json.Title ||
                `HTTP ${response.status}`
            );

        }

    }
    catch {

        // Not JSON

    }


    // XML

    if (
        responseText.trim()
            .startsWith('<?xml') ||
        responseText.trim()
            .startsWith('<')
    ) {

        try {

            const parser =
                new DOMParser();


            const xml =
                parser.parseFromString(
                    responseText,
                    'application/xml'
                );


            const messageNode =
                xml.querySelector(
                    'Message, message, Error, error'
                );


            if (
                messageNode &&
                messageNode.textContent
            ) {

                return messageNode
                    .textContent
                    .trim();

            }


            const parserError =
                xml.querySelector(
                    'parsererror'
                );


            if (parserError) {

                return (
                    `HTTP ${response.status}: ` +
                    responseText.substring(
                        0,
                        500
                    )
                );

            }


            return responseText;

        }
        catch {

            return responseText;

        }

    }


    return responseText;

}


// ============================================================
// GENERATE XML
// ============================================================

async function generateXmlForApplicant(
    applicantId,
    uid,
    officeCode
) {

    if (!applicantId) {

        throw new Error(
            'Applicant ID မရှိပါ။'
        );

    }


    const requestBody = {

        applicantId:
            applicantId,

        uid:
            uid || '',

        officeCode:
            officeCode || ''

    };


    const response =
        await fetch(
            generateXmlUrl,
            {

                method:
                    'POST',

                headers: {

                    'Content-Type':
                        'application/json',

                    'Accept':
                        'application/xml, application/json'

                },

                body:
                    JSON.stringify(
                        requestBody
                    )

            }
        );


    if (!response.ok) {

        const message =
            await getServerErrorMessage(
                response
            );


        throw new Error(
            message
        );

    }


    const blob =
        await response.blob();


    if (
        !blob ||
        blob.size === 0
    ) {

        throw new Error(
            'XML file content မရရှိပါ။'
        );

    }


    return {

        applicantId:
            applicantId,

        fileName:
            `${applicantId}.xml`,

        blob:
            blob

    };

}


// ============================================================
// FOLDER PICKER
// ============================================================

async function chooseXmlFolder() {

    if (
        typeof window.showDirectoryPicker !==
        'function'
    ) {

        throw new Error(
            'ဤစက်၏ Browser မှာ Folder Selection API မရနိုင်ပါ။ Chrome/Edge ကို Update လုပ်ပြီး HTTPS ဖြင့် Website ကို ပြန်ဖွင့်ပါ။'
        );

    }


    if (!window.isSecureContext) {

        throw new Error(
            'Website သည် Secure Context မဟုတ်ပါ။ HTTPS ဖြင့် Website ကို ဖွင့်ပါ။'
        );

    }


    try {

        const directoryHandle =
            await window.showDirectoryPicker({
                mode: 'readwrite'
            });


        return directoryHandle;

    }
    catch (error) {

        if (
            error?.name ===
            'AbortError'
        ) {

            return null;

        }


        throw error;

    }

}


// ============================================================
// SAVE XML
// ============================================================

async function saveXmlToFolder(
    directoryHandle,
    result
) {

    if (!directoryHandle) {

        throw new Error(
            'Folder မရွေးထားပါ။'
        );

    }


    if (
        !result ||
        !result.blob
    ) {

        throw new Error(
            'XML File မရရှိပါ။'
        );

    }


    const fileHandle =
        await directoryHandle.getFileHandle(
            result.fileName,
            {
                create: true
            }
        );


    const writable =
        await fileHandle.createWritable();


    try {

        await writable.write(
            result.blob
        );

    }
    finally {

        await writable.close();

    }

}


// ============================================================
// SUBMIT PRINT
// ============================================================

async function submitPrint() {

    /*
     * Get selected rows from DataTables
     */
    const selectedRows =
        getSelectedApplicants();


    if (
        selectedRows.length === 0
    ) {

        showWarning(
            'Card Print ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။'
        );

        return;

    }


    // ========================================================
    // CHOOSE FOLDER
    // ========================================================

    let directoryHandle;


    try {

        directoryHandle =
            await chooseXmlFolder();


        if (!directoryHandle) {

            return;

        }

    }
    catch (error) {

        showWarning(
            error.message ||
            'Folder ရွေး၍ မရပါ။'
        );

        return;

    }


    // ========================================================
    // BUTTON
    // ========================================================

    const printButton =
        document.getElementById(
            'generateXmlTopBtn'
        );


    let successCount = 0;

    let failedCount = 0;

    const failedApplicants = [];


    try {

        if (printButton) {

            printButton.disabled =
                true;


            printButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1"></span>
                Print လုပ်နေပါသည်...
            `;

        }


        // ====================================================
        // GENERATE ONE BY ONE
        // ====================================================

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


                await saveXmlToFolder(

                    directoryHandle,

                    result

                );


                successCount++;

            }
            catch (error) {

                console.error(
                    `XML Error: ${item.applicantId}`,
                    error
                );


                failedCount++;


                failedApplicants.push({

                    applicantId:
                        item.applicantId,

                    error:
                        error.message ||
                        'print failed'

                });

            }

        }


        // ====================================================
        // RESULT
        // ====================================================

        showXmlResult(

            successCount,

            failedCount,

            failedApplicants

        );

    }
    catch (error) {


        showWarning(
            error.message ||
            'Print လုပ်၍ မရပါ။'
        );

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


// ============================================================
// XML RESULT
// ============================================================

function showXmlResult(
    successCount,
    failedCount,
    failedApplicants
) {

    let message =
        `${successCount} ယောက်အတွက် Print လုပ်ပြီးပါပြီ။`;


    if (failedCount > 0) {

        message +=
            ` ${failedCount} ယောက်ကို Print လုပ်၍ မရပါ။`;

    }


    if (
        failedApplicants &&
        failedApplicants.length > 0
    ) {

        message +=
            '<br><br><strong>Failed Applicants:</strong><br>';


        failedApplicants.forEach(
            function (item) {

                message +=
                    `${escapeHtml(item.applicantId)}: ${escapeHtml(item.error)}<br>`;

            }
        );

    }


    if (
        typeof showAppAlert ===
        'function'
    ) {

        showAppAlert({

            title:
                failedCount === 0
                    ? 'အောင်မြင်ပါသည်'
                    : 'Generate ပြီးပါပြီ',

            message:
                message,

            type:
                failedCount === 0
                    ? 'success'
                    : 'warning',

            confirmText:
                'OK',

            showCancel:
                false

        });

    }
    else {

        alert(
            message
                .replace(/<br>/g, '\n')
                .replace(/<[^>]*>/g, '')
        );

    }

}


// ============================================================
// SUCCESS
// ============================================================

function showSuccess(message) {

    if (
        typeof showAppAlert ===
        'function'
    ) {

        showAppAlert({

            title:
                'အောင်မြင်ပါသည်',

            message:
                message,

            type:
                'success',

            confirmText:
                'OK',

            showCancel:
                false

        });

    }
    else {

        alert(message);

    }

}


// ============================================================
// WARNING
// ============================================================

function showWarning(message) {

    if (
        typeof showAppAlert ===
        'function'
    ) {

        showAppAlert({

            title:
                'သတိပေးချက်',

            message:
                message,

            type:
                'warning',

            confirmText:
                'OK',

            showCancel:
                false

        });

    }
    else {

        alert(message);

    }

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    const div =
        document.createElement('div');


    div.textContent =
        value || '';


    return div.innerHTML;

}


// ============================================================
// MARK PRINTED
// ============================================================

async function markCardAsPrinted(
    applicantId
) {

    try {

        const response =
            await fetch(
                markPrintedUrl,
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

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


        await response.json();


        updatePrintedDate(
            applicantId
        );


        return true;

    }
    catch (error) {

        console.error(
            'Mark Printed Error:',
            error
        );


        return false;

    }

}


// ============================================================
// UPDATE PRINTED DATE
// ============================================================

function updatePrintedDate(
    applicantId
) {

    const button =
        document.querySelector(
            `.preview-card-btn[data-applicant-id="${CSS.escape(
                applicantId
            )}"]`
        );


    if (!button) {
        return;
    }


    const row =
        button.closest('tr');


    if (!row) {
        return;
    }


    /*
     * DataTables-safe way
     */
    const rowData =
        cardTable
            ? cardTable
                .row(row)
            : null;


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
        ).padStart(2, '0');


    const day =
        String(
            today.getDate()
        ).padStart(2, '0');


    printedDateCell.textContent =
        `${year}-${month}-${day}`;


    if (rowData) {

        rowData
            .invalidate()
            .draw(false);

    }

}


// ============================================================
// PRINTED RADIO
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const printedRadio =
            document.getElementById(
                'isPrinted'
            );


        if (!printedRadio) {
            return;
        }


        printedRadio.addEventListener(
            'click',
            function () {

                if (
                    this.dataset.checked ===
                    'true'
                ) {

                    this.checked =
                        false;

                    this.dataset.checked =
                        'false';

                }
                else {

                    this.dataset.checked =
                        'true';

                }

            }
        );

    }
);


// ============================================================
// CARD PREVIEW
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const modal =
            document.getElementById(
                'cardPreviewModal'
            );


        const modalContent =
            document.getElementById(
                'cardPreviewContent'
            );


        const closeBtn =
            document.getElementById(
                'closeCardPreview'
            );


        const printBtn =
            document.querySelector(
                '.preview-print-button'
            );


        if (
            !modal ||
            !modalContent
        ) {

            return;

        }


        let currentApplicantId = null;

        let currentUid = null;

        let currentOfficeCode = null;


        // ====================================================
        // OPEN PREVIEW
        // ====================================================

        document.addEventListener(
            'click',
            async function (e) {

                const button =
                    e.target.closest(
                        '.preview-card-btn'
                    );


                if (!button) {
                    return;
                }


                e.preventDefault();


                currentApplicantId =
                    (
                        button.dataset
                            .applicantId ||
                        ''
                    ).trim();


                currentUid =
                    (
                        button.dataset.uid ||
                        ''
                    ).trim();


                currentOfficeCode =
                    (
                        button.dataset
                            .officeCode ||
                        ''
                    ).trim();


                modal.classList.add(
                    'preview-show'
                );


                document.body.classList.add(
                    'preview-body-lock'
                );


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


                const url =
                    eidCardPrintUrl +
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
                            'text/html'
                        );


                    const card =
                        doc.querySelector(
                            '.nrc-wrapper'
                        );


                    if (!card) {

                        throw new Error(
                            'nrc-wrapper မတွေ့ပါ။'
                        );

                    }


                    modalContent.innerHTML =
                        '';


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
                        'Preview Error:',
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
                                ${escapeHtml(
                        error.message ||
                        'Unknown error'
                    )}
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


        // ====================================================
        // PREVIEW PRINT
        // ====================================================

        if (printBtn) {

            printBtn.addEventListener(
                'click',
                async function () {

                    if (
                        !currentApplicantId
                    ) {

                        showWarning(
                            'Applicant ID မရှိပါ။'
                        );

                        return;

                    }


                    if (
                        printBtn.disabled
                    ) {

                        return;

                    }


                    try {

                        printBtn.disabled =
                            true;


                        printBtn.innerHTML = `
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            Print လုပ်နေပါသည်...
                        `;


                        const directoryHandle =
                            await chooseXmlFolder();


                        if (!directoryHandle) {

                            return;

                        }


                        const result =
                            await generateXmlForApplicant(

                                currentApplicantId,

                                currentUid,

                                currentOfficeCode

                            );


                        await saveXmlToFolder(

                            directoryHandle,

                            result

                        );


                        showSuccess(
                            `${currentApplicantId} အတွက် Print လုပ်ပြီးပါပြီ။`
                        );

                    }
                    catch (error) {


                        showWarning(
                            error.message ||
                            'Print လုပ်၍ မရပါ။'
                        );

                    }
                    finally {

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


        // ====================================================
        // CLOSE
        // ====================================================

        if (closeBtn) {

            closeBtn.addEventListener(
                'click',
                closePreview
            );

        }


        modal.addEventListener(
            'click',
            function (e) {

                if (
                    e.target === modal
                ) {

                    closePreview();

                }

            }
        );


        document.addEventListener(
            'keydown',
            function (e) {

                if (
                    e.key === 'Escape' &&
                    modal.classList.contains(
                        'preview-show'
                    )
                ) {

                    closePreview();

                }

            }
        );


        function closePreview() {

            modal.classList.remove(
                'preview-show'
            );


            document.body.classList.remove(
                'preview-body-lock'
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
                            'preview-show'
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