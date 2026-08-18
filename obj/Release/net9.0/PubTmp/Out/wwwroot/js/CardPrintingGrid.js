$(document).ready(function () {

    //Date Range
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

    //Page load Date

    const fromDate = $('#fromDate').val();
    const toDate = $('#toDate').val();

    if (fromDate && toDate) {

        $('#clearDateRange').addClass('show');

    }
    else {

        $('#clearDateRange').removeClass('show');

    }


    //Clear Date
    $('#clearDateRange').on('click', function () {

        $('#dateRangeFilter').val('');

        $('#dateRangeType').val('');

        $('#fromDate').val('');

        $('#toDate').val('');

        $(this).removeClass('show');

    });

    //search

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


    //function

    initSelectAll();

    fetchOffices();

});

//fetch offices

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
            'Office API Error:',
            error
        );

    }

}

//get applicant data from checkbox

function getApplicantDataFromCheckbox(checkbox) {

    if (!checkbox) {
        return null;
    }

    const applicantId =
        (
            checkbox.dataset.applicantId ||
            checkbox.getAttribute('data-applicant-id') ||
            checkbox.value ||
            ''
        ).trim();

    const uid =
        (
            checkbox.dataset.uid ||
            checkbox.getAttribute('data-uid') ||
            ''
        ).trim();

    const officeCode =
        (
            checkbox.dataset.officeCode ||
            checkbox.getAttribute('data-office-code') ||
            ''
        ).trim();

    return {

        applicantId: applicantId,

        uid: uid,

        officeCode: officeCode

    };

}

//read server error

async function getServerErrorMessage(response) {

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

    //try json

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

    //try json

    if (
        responseText.trim().startsWith('<?xml') ||
        responseText.trim().startsWith('<')
    ) {

        try {

            const parser =
                new DOMParser();

            const xml =
                parser.parseFromString(
                    responseText,
                    'application/xml'
                );


            // Try common error fields

            const messageNode =
                xml.querySelector(
                    'Message, message, Error, error'
                );

            if (
                messageNode &&
                messageNode.textContent
            ) {

                return messageNode.textContent.trim();

            }


            // XML parser error

            const parserError =
                xml.querySelector(
                    'parsererror'
                );

            if (parserError) {

                return (
                    `HTTP ${response.status}: ` +
                    responseText.substring(0, 500)
                );

            }


            // XML exists but no Message field

            return responseText;

        }
        catch {

            return responseText;

        }

    }


    //normal text

    return responseText;

}

//generate xml for one applicant

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

    if (!blob || blob.size === 0) {

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

    console.log('Folder Picker Environment:', {
        api:
            typeof window.showDirectoryPicker,

        secure:
            window.isSecureContext,

        protocol:
            location.protocol,

        url:
            location.href,

        userAgent:
            navigator.userAgent
    });

    if (
        typeof window.showDirectoryPicker !==
        'function'
    ) {

        throw new Error(
            'ဤစက်၏ Browser မှာ Folder Selection API မရနိုင်ပါ။ ' +
            'Chrome/Edge ကို Update လုပ်ပြီး HTTPS ဖြင့် Website ကို ပြန်ဖွင့်ပါ။'
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

        console.log(
            'Selected Folder:',
            directoryHandle.name
        );

        return directoryHandle;

    }
    catch (error) {

        console.error(
            'Folder Picker Error:',
            error
        );

        if (
            error?.name === 'AbortError'
        ) {
            return null;
        }

        throw error;
    }
}
//Submit Print

//async function submitPrint() {

//    const checkboxes =
//        Array.from(
//            document.querySelectorAll(
//                '.applicant-checkbox:checked'
//            )
//        );

//    if (checkboxes.length === 0) {

//        showWarning(
//            'XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။'
//        );

//        return;
//    }

//    const selectedRows =
//        checkboxes
//            .map(function (checkbox) {

//                return getApplicantDataFromCheckbox(
//                    checkbox
//                );

//            })
//            .filter(function (item) {

//                return (
//                    item &&
//                    item.applicantId
//                );

//            });

//    if (selectedRows.length === 0) {

//        showWarning(
//            'ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။'
//        );

//        return;
//    }

//    // User ရွေးတဲ့ folder
//    let directoryHandle;

//    try {

//        directoryHandle =
//            await chooseXmlFolder();

//        if (!directoryHandle) {
//            return;
//        }

//    }
//    catch (error) {

//        showWarning(
//            error.message ||
//            'Folder ရွေး၍ မရပါ။'
//        );

//        return;
//    }

//    const printButton =
//        document.getElementById(
//            'generateXmlTopBtn'
//        );

//    let successCount = 0;
//    let failedCount = 0;
//    const failedApplicants = [];

//    try {

//        if (printButton) {

//            printButton.disabled = true;

//            printButton.innerHTML = `
//                <span class="spinner-border spinner-border-sm me-1"></span>
//                XML Generate လုပ်နေပါသည်...
//            `;
//        }

//        // Applicant တစ်ယောက်ချင်း Generate + Save
//        for (const item of selectedRows) {

//            try {

//                // Server က XML generate
//                const result =
//                    await generateXmlForApplicant(
//                        item.applicantId,
//                        item.uid,
//                        item.officeCode
//                    );

//                // User ရွေးထားတဲ့ folder ထဲ save
//                await saveXmlToFolder(
//                    directoryHandle,
//                    result
//                );

//                successCount++;

//            }
//            catch (error) {

//                console.error(
//                    `XML Error: ${item.applicantId}`,
//                    error
//                );

//                failedCount++;

//                failedApplicants.push({

//                    applicantId:
//                        item.applicantId,

//                    error:
//                        error.message ||
//                        'XML Generate failed'

//                });
//            }
//        }

//        showXmlResult(
//            successCount,
//            failedCount,
//            failedApplicants
//        );

//    }
//    catch (error) {

//        console.error(
//            'XML Generate Error:',
//            error
//        );

//        showWarning(
//            error.message ||
//            'XML Generate ပြုလုပ်၍ မရပါ။'
//        );

//    }
//    finally {

//        if (printButton) {

//            printButton.disabled = false;

//            printButton.innerHTML = `
//                <i class="fa-solid fa-file-code me-1"></i>
//                PRINT
//            `;
//        }
//    }
//}

// SAVE XML TO SELECTED FOLDER

async function saveXmlToFolder(
    directoryHandle,
    result
) {

    if (!directoryHandle) {

        throw new Error(
            'Folder မရွေးထားပါ။'
        );
    }

    if (!result || !result.blob) {

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
            ' ရှိပြီးသား XML File များရှိပါက Overwrite ပြုလုပ်ထားပါသည်။';

    }


    if (failedCount > 0) {

        message +=
            ` ${failedCount} ယောက်ကို Generate ပြုလုပ်၍ မရပါ။`;

    }


    // Show failed details

    if (
        failedApplicants &&
        failedApplicants.length > 0
    ) {

        message +=
            '<br><br><strong>Failed Applicants:</strong><br>';

        failedApplicants.forEach(
            function (item) {

                message +=
                    `${item.applicantId}: ${item.error}<br>`;

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
            message.replace(
                /<br>/g,
                '\n'
            ).replace(
                /<[^>]*>/g,
                ''
            )
        );

    }

}


// CHECKBOX -> GENERATE XML -> SAVE FOLDER

async function submitPrint() {

    const checkboxes =
        Array.from(
            document.querySelectorAll(
                '.applicant-checkbox:checked'
            )
        );


    //no applicant selected
    if (checkboxes.length === 0) {

        showWarning(
            'XML Generate ပြုလုပ်ရန် Applicant ကို အနည်းဆုံးတစ်ယောက် ရွေးပါ။'
        );

        return;
    }

    //choose folder

    let directoryHandle;

    try {

        directoryHandle =
            await chooseXmlFolder();

        if (!directoryHandle) {

            // User Cancel
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

    //get selected applicants

    const selectedRows =
        checkboxes
            .map(function (checkbox) {

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
                        data.officeCode
                };

            })
            .filter(function (item) {

                return (
                    item &&
                    item.applicantId
                );
            });

    if (selectedRows.length === 0) {

        showWarning(
            'ရွေးထားသော row များတွင် Applicant ID မတွေ့ပါ။'
        );

        return;
    }

    //button

    const printButton =
        document.getElementById(
            'generateXmlTopBtn'
        );

    let successCount = 0;

    let failedCount = 0;

    const failedApplicants = [];

    try {

        if (printButton) {

            printButton.disabled = true;

            printButton.innerHTML = `
                <span class="spinner-border spinner-border-sm me-1"></span>
                XML Generate လုပ်နေပါသည်...
            `;
        }

        //generate one by one

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

                //save user selected folder

                await saveXmlToFolder(
                    directoryHandle,
                    result
                );

                successCount++;

            }
            catch (error) {

                console.error(
                    'XML Generate Error:',
                    error
                );

                failedCount++;

                failedApplicants.push({

                    applicantId:
                        item.applicantId,

                    error:
                        error.message ||
                        'Request failed'
                });
            }
        }

        //result

        showXmlResult(

            successCount,

            failedCount,

            failedApplicants
        );

    }
    catch (error) {

        console.error(
            'XML Generate Error:',
            error
        );

        showWarning(
            error.message ||
            'XML Generate ပြုလုပ်၍ မရပါ။'
        );
    }
    finally {

        if (printButton) {

            printButton.disabled = false;

            printButton.innerHTML = `
                <i class="fa-solid fa-file-code me-1"></i>
                PRINT
            `;
        }
    }
}

//card preview

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

            console.warn(
                'Card Preview elements not found.'
            );

            return;

        }


        //current applicant

        let currentApplicantId =
            null;

        let currentUid =
            null;

        let currentOfficeCode =
            null;


        //open preview

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


                //save current data

                currentApplicantId =
                    (
                        button.dataset.applicantId ||
                        ''
                    ).trim();


                currentUid =
                    (
                        button.dataset.uid ||
                        ''
                    ).trim();


                currentOfficeCode =
                    (
                        button.dataset.officeCode ||
                        ''
                    ).trim();


                //show modal

                modal.classList.add(
                    'preview-show'
                );

                document.body.classList.add(
                    'preview-body-lock'
                );


                //loading

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


                //build url

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


                    //show card

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


        //generate xml and save folder

        if (printBtn) {

            printBtn.addEventListener(
                'click',
                async function () {

                    //check applicants

                    if (
                        !currentApplicantId
                    ) {

                        showWarning(
                            'Applicant ID မရှိပါ။'
                        );

                        return;

                    }

                    //review double click

                    if (
                        printBtn.disabled
                    ) {

                        return;

                    }


                    try {

                        //disabled button

                        printBtn.disabled =
                            true;

                        printBtn.innerHTML = `
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            XML Generate လုပ်နေပါသည်...
                        `;


                        //choose folder

                        const directoryHandle =
                            await chooseXmlFolder();


                        if (!directoryHandle) {

                            printBtn.disabled =
                                false;

                            printBtn.innerHTML = `
                                <i class="fa-solid fa-file-code me-1"></i>
                                PRINT
                            `;

                            return;

                        }

                        //generate xml

                        const result =
                            await generateXmlForApplicant(

                                currentApplicantId,

                                currentUid,

                                currentOfficeCode

                            );


                        //save xml
                        await saveXmlToFolder(
                            directoryHandle,
                            result
                        );


                        // ----------------------------------------
                        // SUCCESS
                        // ----------------------------------------

                        showSuccess(
                            `${currentApplicantId} အတွက် XML File Generate ပြုလုပ်ပြီးပါပြီ။`
                        );

                    }
                    catch (error) {

                        console.error(
                            'Preview XML Generate Error:',
                            error
                        );


                        if (
                            typeof showAppAlert ===
                            'function'
                        ) {

                            showAppAlert({

                                title:
                                    'အမှားဖြစ်နေပါသည်',

                                message:
                                    error.message ||
                                    'XML Generate ပြုလုပ်၍ မရပါ။',

                                type:
                                    'error',

                                confirmText:
                                    'OK',

                                showCancel:
                                    false

                            });

                        }
                        else {

                            alert(
                                error.message ||
                                'XML Generate ပြုလုပ်၍ မရပါ။'
                            );

                        }

                    }
                    finally {

                        //restore button

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

        //close btn

        if (closeBtn) {

            closeBtn.addEventListener(
                'click',
                closePreview
            );

        }

        //click outside

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

        //esc

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


        //close preview

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


//helper success alert

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
//helper warnung alert

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


//helper escape html

function escapeHtml(value) {

    const div =
        document.createElement('div');

    div.textContent =
        value || '';

    return div.innerHTML;

}


//mark card as printed

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

//update printed date

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

}

//printed radio

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


//selectAll

function initSelectAll() {

    const selectAll =
        document.getElementById(
            'selectAllApplicants'
        );


    if (!selectAll) {

        return;

    }


    //all checkbox click

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


            updateSelectAllState();

        }
    );

    //individual select checkbox

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


//update select all state

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


    if (
        checkboxes.length === 0
    ) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

        return;

    }


    const checkedCount =
        checkboxes.filter(
            function (checkbox) {

                return checkbox.checked;

            }
        ).length;


    if (
        checkedCount === 0
    ) {

        selectAll.checked =
            false;

        selectAll.indeterminate =
            false;

    }
    else if (
        checkedCount ===
        checkboxes.length
    ) {

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