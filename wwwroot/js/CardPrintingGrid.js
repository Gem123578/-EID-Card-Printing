
let cardTable = null;

const SELECTED_STORAGE_KEY = 'selectedApplicants';

const CARD_SEARCH_PERFORMED_KEY = 'cardSearchPerformed';


$(document).ready(function () {

    initCardDataTable();

    initSelectAll();

    initDateRange();

    initSearchForm();

    initOfficerOffice();


    if (
        typeof serverApplicants !== 'undefined' &&
        Array.isArray(serverApplicants) &&
        serverApplicants.length > 0
    ) {

        loadApplicantDataToTable(
            serverApplicants
        );

    }
    $(document).on(
        'click.cardSidebarClear',
        'a',
        function (e) {

            const href = $(this).attr('href');



            if (!href) {
                return;
            }


            if (
                href === '#' ||
                href.startsWith('javascript:')
            ) {
                return;
            }



            const currentUrl =
                window.location.pathname +
                window.location.search;



            let linkUrl;

            try {

                linkUrl =
                    new URL(
                        href,
                        window.location.origin
                    );

            }
            catch (error) {

                return;

            }



            const targetUrl =
                linkUrl.pathname +
                linkUrl.search;

            if (targetUrl !== currentUrl) {

                clearSelectedApplicants();


            }

        }
    );


    // Restore checkbox state
    restoreCheckboxState();

});

//async function loadTodayApplicants() {

//    const today = moment().format('YYYY-MM-DD');

//    console.log('Today Applicant Search:', today);

//    const url =
//        '/Home/CardPrintingGrid' +
//        '?isSearch=true' +
//        `&IsPrinted=${encodeURIComponent(isPrintedPage)}` +
//        '&FromDate=' + encodeURIComponent(today) +
//        '&ToDate=' + encodeURIComponent(today);

//    try {

//        const response = await fetch(url, {
//            method: 'GET',
//            headers: {
//                'Accept': 'text/html'
//            }
//        });

//        console.log(
//            'CardPrintingGrid Status:',
//            response.status
//        );

//        if (!response.ok) {

//            const text = await response.text();

//            throw new Error(
//                `HTTP ${response.status}: ${text}`
//            );
//        }

//        const html = await response.text();

//        console.log(
//            'CardPrintingGrid HTML loaded.'
//        );


//    }
//    catch (error) {

//        console.error(
//            'Today Applicant API Error:',
//            error
//        );

//        showWarning(
//            error.message ||
//            'ယနေ့ Applicant data ရှာ၍ မရပါ။'
//        );
//    }
//}

async function initOfficerOffice() {

    const filterForm =
        $('#regionalOfficerFilter');

    try {

        const response =
            await fetch('/Home/GetCurrentOfficer');

        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );

        }

        const officer =
            await response.json();

        const officeCode =
            (
                officer.office_code ||
                officer.officeCode ||
                ''
            )
                .trim()
                .toUpperCase();




        if (officeCode === 'HO') {


            filterForm.show();

            await fetchOffices();

            return;

        }



        filterForm.hide();

        $('#tableContainer').show();

    }
    catch (error) {

        console.error(
            'Current Officer Error:',
            error
        );

    }

}



function loadApplicantDataToTable(data) {

    if (!cardTable) {

        console.error(
            'DataTable is not initialized.'
        );

        return;

    }


    if (!Array.isArray(data)) {

        console.warn(
            'Applicant data is not an array.'
        );

        return;

    }


    // Clear old rows
    cardTable.clear();


    data.forEach(function (applicant) {

        const applicantId =
            applicant.applicantId ??
            applicant.ApplicantId ??
            '';

        const uid =
            applicant.uId ??
            applicant.uid ??
            applicant.UId ??
            '';

        const officeCode =
            applicant.officeCode ??
            applicant.OfficeCode ??
            '';

        const personNameMM =
            applicant.personNameMM ??
            applicant.PersonNameMM ??
            '-';

        const personNameEN =
            applicant.personNameEN ??
            applicant.PersonNameEN ??
            '-';

        const gender =
            applicant.gender ??
            applicant.Gender ??
            '-';

        const dob =
            applicant.dob ??
            applicant.DOB ??
            null;

        const doe =
            applicant.doe ??
            applicant.DOE ??
            null;

        const nrc =
            applicant.nrc ??
            applicant.NRC ??
            '-';

        const printedDate =
            applicant.printedDate ??
            applicant.PrintedDate ??
            null;


        const row = [


            `
            <input type="checkbox"
                   class="form-check-input applicant-checkbox"
                   value="${escapeHtml(applicantId)}"
                   data-applicant-id="${escapeHtml(applicantId)}"
                   data-uid="${escapeHtml(uid)}"
                   data-office-code="${escapeHtml(officeCode)}"
                   >
            `,



            escapeHtml(personNameMM),



            escapeHtml(personNameEN),



            escapeHtml(gender),


            formatDate(dob),



            escapeHtml(uid),


            formatDate(doe),



            escapeHtml(nrc),


            formatDate(printedDate),



            `
            <div class="text-center">

                <a href="#"
                   class="btn btn-sm btn-outline-success preview-card-btn"
                   data-applicant-id="${escapeHtml(applicantId)}"
                   data-uid="${escapeHtml(uid)}"
                   data-office-code="${escapeHtml(officeCode)}"
                   title="Print Preview">

                    <i class="fa-solid fa-print me-1"></i>

                    <span>
                        Print Preview
                    </span>

                </a>

            </div>
            `

        ];


        cardTable.row.add(row);

    });


    cardTable.draw();


    // Restore checked state after DataTable draws
    restoreCheckboxState();

    updateSelectAllState();

}


function formatDate(value) {

    if (!value) {
        return '';
    }


  

        const date =
            String(value);


        if (date.length >= 10) {

            return escapeHtml(
                date.substring(0, 10)
            );

        }


        return escapeHtml(date);

    }




function initCardDataTable() {

    const table = $('#cardTable');

    if (!table.length) {
        return;
    }

    // Already initialized
    if ($.fn.DataTable.isDataTable('#cardTable')) {

        cardTable = table.DataTable();

        return;
    }

    cardTable = table.DataTable({


        paging: true,

        pageLength: 10,

        lengthChange: true,

        lengthMenu: [
            [10, 25, 50, 100],
            [10, 25, 50, 100]
        ],

        searching: true,

        ordering: true,

        info: true,

        responsive: true,

        autoWidth: false,

        // Printed Date
        order: [
            [8, 'desc']
        ],

        orderCellsTop: true,

        layout: {
            topStart: [
                'pageLength',
                {
                    buttons: [
                        {
                            extend: 'collection',
                            text: 'Export',
                            buttons: [
                                'copy',
                                'excel',
                                'csv',
                                'print'
                            ]
                        }
                    ]
                }
            ],

            topEnd: 'search'
        },
        columnDefs: [

            {
                targets: 0,
                orderable: false,
                searchable: false,
                className: 'text-center'
            },

            {
                targets: 9,
                orderable: false,
                searchable: false,
                className: 'text-center'
            }

        ],

        language: {

            search: "အားလုံးရှာရန်:",

            lengthMenu: "Show_MENU_ Entries",

            info:
                "Showing _START_ to _END_ of _TOTAL_",

            infoEmpty:
                "Showing _START_ to _END_ of _TOTAL_",

            zeroRecords:
                "No Data",

            emptyTable:
                "No Data",

            paginate: {

                next: "Next",

                previous: "Previous"

            }

        },

        drawCallback: function () {

            restoreCheckboxState();

            updateSelectAllState();

        },

        initComplete: function () {

            const api = this.api();

            $('.column-search')
                .off(
                    'keyup.cardColumnSearch change.cardColumnSearch'
                )
                .on(
                    'keyup.cardColumnSearch change.cardColumnSearch',
                    function () {

                        const columnIndex =
                            Number(
                                $(this).data('column')
                            );

                        const value =
                            this.value.trim();

                        if (
                            api
                                .column(columnIndex)
                                .search() !== value
                        ) {

                            api
                                .column(columnIndex)
                                .search(value)
                                .draw();

                        }

                    }
                );

        }

    });

}

function initSearchForm() {

    $('#cardSearchForm')
        .off('submit.cardSearch')
        .on('submit.cardSearch', async function (e) {

            e.preventDefault();
            e.stopPropagation();

            const form = this;

            const searchInput =
                document.getElementById('SearchTerm');

            if (searchInput) {
                searchInput.value =
                    searchInput.value
                        .trim()
                        .replace(/\s+/g, ' ');
            }

            // Previous selected checkbox clear
            clearSelectedApplicants();

            const submitButton =
                $(form).find('button[type="submit"]');

            const originalHtml =
                submitButton.html();

            try {

                submitButton.prop('disabled', true);

                submitButton.html(`
                    <span class="spinner-border spinner-border-sm me-1"></span>
                    Searching...
                `);

                // Form data
                const formData =
                    new FormData(form);

                // GET query string
                const params =
                    new URLSearchParams(formData);

                const url =
                    form.action +
                    '?' +
                    params.toString();

                console.log('Search URL:', url);

                // IMPORTANT:
                // Controller ကို normal browser navigation မလုပ်ဘဲ
                // fetch နဲ့ request လုပ်မယ်
                const response =
                    await fetch(url, {
                        method: 'GET',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                if (!response.ok) {

                    throw new Error(
                        `HTTP Error: ${response.status}`
                    );

                }

                const html =
                    await response.text();

                // Returned Razor View ထဲက serverApplicants ကို extract
                const applicants =
                    extractApplicantsFromHtml(html);

                // DataTable only update
                loadApplicantDataToTable(
                    applicants
                );

                // table ပြ
                $('#tableContainer').show();


            }
            catch (error) {

                console.error(
                    'Applicant Search Error:',
                    error
                );

                showWarning(
                    error.message ||
                    'Search လုပ်၍ မရပါ။'
                );

            }
            finally {

                submitButton.prop(
                    'disabled',
                    false
                );

                submitButton.html(
                    originalHtml
                );

            }

        });

}

function extractApplicantsFromHtml(html) {

    try {

        const parser =
            new DOMParser();

        const doc =
            parser.parseFromString(
                html,
                'text/html'
            );

        const scripts =
            doc.querySelectorAll('script');

        let applicants = [];

        scripts.forEach(function (script) {

            const text =
                script.textContent || '';

            if (
                text.includes('const serverApplicants')
            ) {

                const match =
                    text.match(
                        /const\s+serverApplicants\s*=\s*(\[[\s\S]*?\]);/
                    );

                if (match && match[1]) {

                    try {

                        applicants =
                            JSON.parse(match[1]);

                    }
                    catch (error) {

                        console.error(
                            'serverApplicants JSON Parse Error:',
                            error
                        );

                    }

                }

            }

        });

        return Array.isArray(applicants)
            ? applicants
            : [];

    }
    catch (error) {

        console.error(
            'Extract Applicant Error:',
            error
        );

        return [];

    }

}
async function fetchOffices() {

    const officeSelect =
        $('#officeSelect');


    if (!officeSelect.length) {

        return;

    }


    try {

        const urlParams =
            new URLSearchParams(
                window.location.search
            );


        const selectedOfficeCode =
            urlParams.get(
                'OfficeCode'
            ) || '';


        officeSelect.css(
            'visibility',
            'hidden'
        );


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


        if (
            officeSelect.hasClass(
                'select2-hidden-accessible'
            )
        ) {

            officeSelect.select2(
                'destroy'
            );

        }


        officeSelect.select2({

            placeholder:
                '-- Office Stations ရွေးပါ --',

            allowClear: true,

            width: '100%'

        });


        if (selectedOfficeCode) {

            officeSelect
                .val(selectedOfficeCode)
                .trigger('change');

        }


        officeSelect.css(
            'visibility',
            'visible'
        );

    }
    catch (error) {

        console.error(
            'Office API Error:',
            error
        );


        officeSelect.css(
            'visibility',
            'visible'
        );

    }

}


function initDateRange() {

    const dateFilter = $('#dateRangeFilter');

    if (!dateFilter.length) {
        return;
    }

    /*
     * ---------------------------------------------------------
     * Helper: Date value set
     * ---------------------------------------------------------
     */
    function setDateRangeValues(start, end, rangeType) {

        if (
            !start ||
            !end ||
            !moment.isMoment(start) ||
            !moment.isMoment(end) ||
            !start.isValid() ||
            !end.isValid()
        ) {

            console.error(
                'Invalid Date Range:',
                start,
                end
            );

            return false;
        }

        const fromDate =
            start.format('YYYY-MM-DD');

        const toDate =
            end.format('YYYY-MM-DD');


        $('#dateRangeType').val(
            rangeType || 'custom'
        );

        $('#fromDate').val(
            fromDate
        );

        $('#toDate').val(
            toDate
        );

        $('#dateRangeFilter').val(
            `${fromDate} - ${toDate}`
        );

        $('#clearDateRange').addClass('show');


        console.log(
            'Date Range Set:',
            {
                rangeType: rangeType,
                fromDate: fromDate,
                toDate: toDate
            }
        );

        return true;
    }


    /*
     * ---------------------------------------------------------
     * Today
     * ---------------------------------------------------------
     */
    const today =
        moment().startOf('day');


    /*
     * ---------------------------------------------------------
     * Existing Model Date
     * ---------------------------------------------------------
     */
    let initialFrom =
        $('#fromDate').val();

    let initialTo =
        $('#toDate').val();


    let startDate;
    let endDate;


    /*
     * Server မှ date valid ဖြစ်ရင် အသုံးပြု
     */
    if (
        initialFrom &&
        initialTo &&
        moment(
            initialFrom,
            'YYYY-MM-DD',
            true
        ).isValid() &&
        moment(
            initialTo,
            'YYYY-MM-DD',
            true
        ).isValid()
    ) {

        startDate =
            moment(
                initialFrom,
                'YYYY-MM-DD',
                true
            );

        endDate =
            moment(
                initialTo,
                'YYYY-MM-DD',
                true
            );

    }
    else {

        /*
         * Initial page မှာ Today
         */
        startDate =
            today.clone();

        endDate =
            today.clone();

        setDateRangeValues(
            startDate,
            endDate,
            'today'
        );

    }


    /*
     * ---------------------------------------------------------
     * Destroy old daterangepicker
     * ---------------------------------------------------------
     */
    if (
        dateFilter.data(
            'daterangepicker'
        )
    ) {

        dateFilter
            .data(
                'daterangepicker'
            )
            .remove();

    }


    /*
     * ---------------------------------------------------------
     * Date Range Picker
     * ---------------------------------------------------------
     */
    dateFilter.daterangepicker({

        autoUpdateInput: false,

        autoApply: false,

        opens: 'left',

        drops: 'down',

        parentEl: 'body',

        linkedCalendars: false,

        showDropdowns: true,

        /*
         * IMPORTANT
         * Picker ကို valid moment object ပေး
         */
        startDate:
            startDate.clone(),

        endDate:
            endDate.clone(),


        ranges: {

            'Today': [
                moment().startOf('day'),
                moment().endOf('day')
            ],

            'Last 7 Days': [
                moment()
                    .subtract(6, 'days')
                    .startOf('day'),

                moment().endOf('day')
            ],

            'This Month': [
                moment()
                    .startOf('month'),

                moment().endOf('day')
            ],

            'Last Year': [
                moment()
                    .subtract(1, 'year')
                    .startOf('year'),

                moment()
                    .subtract(1, 'year')
                    .endOf('year')
            ]

        }

    });


    /*
     * ---------------------------------------------------------
     * Apply
     * ---------------------------------------------------------
     */
    dateFilter
        .off(
            'apply.daterangepicker.cardDate'
        )
        .on(
            'apply.daterangepicker.cardDate',
            function (ev, picker) {

                /*
                 * Picker date ကို direct ယူ
                 */
                let start =
                    picker.startDate;

                let end =
                    picker.endDate;


                /*
                 * Invalid date protection
                 */
                if (
                    !start ||
                    !end ||
                    !moment.isMoment(start) ||
                    !moment.isMoment(end) ||
                    !start.isValid() ||
                    !end.isValid()
                ) {

                    console.error(
                        'Invalid picker date:',
                        {
                            start: start,
                            end: end
                        }
                    );

                    showWarning(
                        'Date Range မမှန်ကန်ပါ။'
                    );

                    return;

                }


                /*
                 * Default = custom
                 */
                let rangeType =
                    'custom';


                /*
                 * Today
                 */
                if (
                    start.isSame(
                        moment(),
                        'day'
                    ) &&
                    end.isSame(
                        moment(),
                        'day'
                    )
                ) {

                    rangeType =
                        'today';

                }


                /*
                 * Last 7 Days
                 */
                else if (
                    start.isSame(
                        moment()
                            .subtract(
                                6,
                                'days'
                            ),
                        'day'
                    ) &&
                    end.isSame(
                        moment(),
                        'day'
                    )
                ) {

                    rangeType =
                        'last7';

                }


                /*
                 * This Month
                 */
                else if (
                    start.isSame(
                        moment()
                            .startOf('month'),
                        'day'
                    ) &&
                    end.isSame(
                        moment(),
                        'day'
                    )
                ) {

                    rangeType =
                        'thisMonth';

                }


                /*
                 * Last Year
                 */
                else if (
                    start.isSame(
                        moment()
                            .subtract(
                                1,
                                'year'
                            )
                            .startOf('year'),
                        'day'
                    ) &&
                    end.isSame(
                        moment()
                            .subtract(
                                1,
                                'year'
                            )
                            .endOf('year'),
                        'day'
                    )
                ) {

                    rangeType =
                        'lastYear';

                }


                /*
                 * Set FromDate / ToDate
                 */
                setDateRangeValues(
                    start,
                    end,
                    rangeType
                );

            }
        );


    /*
     * ---------------------------------------------------------
     * Cancel
     * ---------------------------------------------------------
     */
    dateFilter
        .off(
            'cancel.daterangepicker.cardDate'
        )
        .on(
            'cancel.daterangepicker.cardDate',
            function () {

                console.log(
                    'Date selection cancelled.'
                );

            }
        );


    /*
     * ---------------------------------------------------------
     * Clear
     * ---------------------------------------------------------
     */
    $('#clearDateRange')
        .off(
            'click.cardDateClear'
        )
        .on(
            'click.cardDateClear',
            function () {

                $('#dateRangeFilter').val('');

                $('#dateRangeType').val('');

                $('#fromDate').val('');

                $('#toDate').val('');

                $(this).removeClass('show');

            }
        );


    /*
     * ---------------------------------------------------------
     * Initial display
     * ---------------------------------------------------------
     */
    const currentFrom =
        $('#fromDate').val();

    const currentTo =
        $('#toDate').val();


    if (
        currentFrom &&
        currentTo &&
        moment(
            currentFrom,
            'YYYY-MM-DD',
            true
        ).isValid() &&
        moment(
            currentTo,
            'YYYY-MM-DD',
            true
        ).isValid()
    ) {

        $('#dateRangeFilter').val(
            `${currentFrom} - ${currentTo}`
        );

        $('#clearDateRange').addClass(
            'show'
        );

    }

}

function getApplicantDataFromCheckbox(
    checkbox
) {

    if (!checkbox) {

        return null;

    }


    const applicantId =
        (
            checkbox.dataset.applicantId ||
            checkbox.value ||
            ''
        ).trim();


    const uid =
        (
            checkbox.dataset.uid ||
            ''
        ).trim();


    const officeCode =
        (
            checkbox.dataset.officeCode ||
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


function getSelectedApplicants() {

    const selectedApplicants =
        getStoredSelectedApplicants();


    return Object.values(
        selectedApplicants
    );

}



function getStoredSelectedApplicants() {

    try {

        const data =
            localStorage.getItem(
                SELECTED_STORAGE_KEY
            );


        if (!data) {

            return {};

        }


        const parsed =
            JSON.parse(data);


        if (
            !parsed ||
            typeof parsed !== 'object'
        ) {

            return {};

        }


        return parsed;

    }
    catch (error) {

        console.error(
            'Selected Applicant Storage Error:',
            error
        );


        return {};

    }

}


function saveStoredSelectedApplicants(
    data
) {

    try {

        localStorage.setItem(
            SELECTED_STORAGE_KEY,
            JSON.stringify(data)
        );

    }
    catch (error) {

        console.error(
            'Save Selected Applicant Error:',
            error
        );

    }

}



function clearSelectedApplicants() {

    localStorage.removeItem(
        SELECTED_STORAGE_KEY
    );

}


function restoreCheckboxState() {

    const selectedApplicants =
        getStoredSelectedApplicants();


    $('#cardTable')
        .find(
            '.applicant-checkbox'
        )
        .each(function () {

            const applicantId =
                (
                    this.dataset.applicantId ||
                    this.value ||
                    ''
                ).trim();


            if (!applicantId) {

                this.checked = false;

                return;

            }


            this.checked =
                Object.prototype.hasOwnProperty.call(
                    selectedApplicants,
                    applicantId
                );

        });


    updateSelectAllState();

}



function initSelectAll() {



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


                selectAllDataTableRows(
                    checked
                );

            }
        );



    $(document)
        .off(
            'change.cardCheckbox',
            '#cardTable tbody .applicant-checkbox'
        )
        .on(
            'change.cardCheckbox',
            '#cardTable tbody .applicant-checkbox',
            function () {

                const checkbox =
                    this;


                const data =
                    getApplicantDataFromCheckbox(
                        checkbox
                    );


                if (
                    !data ||
                    !data.applicantId
                ) {

                    return;

                }


                const selectedApplicants =
                    getStoredSelectedApplicants();


                if (checkbox.checked) {

                    selectedApplicants[
                        data.applicantId
                    ] = data;

                }
                else {

                    delete selectedApplicants[
                        data.applicantId
                    ];

                }


                saveStoredSelectedApplicants(
                    selectedApplicants
                );


                updateSelectAllState();

            }
        );


    $('#cardTable')
        .off(
            'draw.dt.cardCheckbox'
        )
        .on(
            'draw.dt.cardCheckbox',
            function () {

                restoreCheckboxState();

                updateSelectAllState();

            }
        );

}


function selectAllDataTableRows(
    checked
) {

    if (!cardTable) {

        return;

    }


    const selectedApplicants =
        getStoredSelectedApplicants();



    cardTable.rows().every(function () {

        const rowData =
            this.data();


        if (
            !rowData ||
            !rowData[0]
        ) {

            return;

        }


        const tempDiv =
            document.createElement(
                'div'
            );


        tempDiv.innerHTML =
            rowData[0];


        const checkbox =
            tempDiv.querySelector(
                '.applicant-checkbox'
            );


        if (!checkbox) {

            return;

        }



        const data =
            getApplicantDataFromCheckbox(
                checkbox
            );


        if (
            !data ||
            !data.applicantId
        ) {

            return;

        }



        if (checked) {

            selectedApplicants[
                data.applicantId
            ] = data;

        }



        else {

            delete selectedApplicants[
                data.applicantId
            ];

        }

    });



    saveStoredSelectedApplicants(
        selectedApplicants
    );



    restoreCheckboxState();



    updateSelectAllState();

}



function updateSelectAllState() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );


    if (!selectAll) {

        return;

    }


    if (!cardTable) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

        return;

    }


    const selectedApplicants =
        getStoredSelectedApplicants();


    let total = 0;

    let selectedCount = 0;


    cardTable.rows().every(function () {

        const rowData =
            this.data();


        if (
            !rowData ||
            !rowData[0]
        ) {

            return;

        }


        const tempDiv =
            document.createElement(
                'div'
            );


        tempDiv.innerHTML =
            rowData[0];


        const checkbox =
            tempDiv.querySelector(
                '.applicant-checkbox'
            );


        if (!checkbox) {

            return;

        }


        const applicantId =
            (
                checkbox.dataset.applicantId ||
                checkbox.value ||
                ''
            ).trim();


        if (!applicantId) {

            return;

        }


        total++;


        if (
            Object.prototype.hasOwnProperty.call(
                selectedApplicants,
                applicantId
            )
        ) {

            selectedCount++;

        }

    });



    if (total === 0) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

        return;

    }



    if (selectedCount === total) {

        selectAll.checked =
            true;

        selectAll.indeterminate =
            false;

    }


    else if (selectedCount > 0) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            true;

    }



    else {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

    }

}



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


    try {

        const json =
            JSON.parse(
                responseText
            );


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

    }


    return responseText;

}



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
            officeCode || '',

        isPrinted: isPrintedPage

    };



    const response =
        await fetch(
            generateXmlUrl,
            {

                method: 'POST',

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


async function chooseXmlFolder() {


    try {

        return await window.showDirectoryPicker({
            mode: 'readwrite'
        });

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


async function saveXmlToFolder(
    directoryHandle,
    result
) {

    if (!directoryHandle) {

        throw new Error(
            'Folder မရွေးထားပါ။'
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


async function submitPrint() {


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



        for (
            const item of selectedRows
        ) {

            try {


                const result =
                    await generateXmlForApplicant(

                        item.applicantId,

                        item.uid,

                        item.officeCode,
                       

                    );


                await saveXmlToFolder(

                    directoryHandle,

                    result

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
                        'print failed'

                });

            }

        }


        showXmlResult(
            successCount,
            failedCount,
            failedApplicants
        );



        if (
            successCount > 0
        ) {

            const selectedApplicants =
                getStoredSelectedApplicants();


            selectedRows.forEach(function (item) {

                if (
                    !failedApplicants.some(
                        function (failed) {

                            return (
                                failed.applicantId ===
                                item.applicantId
                            );

                        }
                    )
                ) {

                    delete selectedApplicants[
                        item.applicantId
                    ];

                }

            });


            saveStoredSelectedApplicants(
                selectedApplicants
            );


            restoreCheckboxState();

            updateSelectAllState();

        }

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
                CARD PRINT
            `;

        }

    }

}



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

function escapeHtml(value) {

    const div =
        document.createElement(
            'div'
        );


    div.textContent =
        value ?? '';


    return div.innerHTML;

}


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
                        button.dataset
                            .uid ||
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

                }


                const url =
                    eidCardPrintUrl +
                    `?applicantId=${encodeURIComponent(currentApplicantId)}` +
                    `&uid=${encodeURIComponent(currentUid)}` +
                    `&officeCode=${encodeURIComponent(currentOfficeCode)}` +
                    `&IsPrinted=${encodeURIComponent(isPrintedPage)}` +
                    `&FromDate=${encodeURIComponent(fromDate)}` +
                    `&ToDate=${encodeURIComponent(toDate)}`;

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

                }

            }
        );



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
                            <i class="fa-solid fa-print me-1"></i>
                            Print Card
                        `;

                    }

                }
            );

        }



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


            currentApplicantId = null;

            currentUid = null;

            currentOfficeCode = null;

        }

    }
);
