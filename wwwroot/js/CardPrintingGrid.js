$(document).ready(function () {

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
                moment().endOf('month')
            ],

            'Last Year': [
                moment().subtract(1, 'year').startOf('year'),
                moment().subtract(1, 'year').endOf('year')
            ]
        }

    }, function (start, end, label) {

        $('#dateRangeFilter').val(
            start.format('YYYY-MM-DD') +
            ' - ' +
            end.format('YYYY-MM-DD')
        );

    });

});

//Office Select
async function fetchOffices() {

    try {

        const response = await fetch('/Home/GetOffices');

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();


        const officeSelect =
            $('#officeSelect');

        officeSelect.empty();

        officeSelect.append(
            new Option('-- Office Stations ရွေးပါ --', '')
        );

        data.forEach(function (office) {

            officeSelect.append(
                new Option(
                    office.stationName,
                    office.stationCode
                )
            );

        });

        // Searchable dropdown
        officeSelect.select2({
            placeholder: '-- Office Stations ရွေးပါ --',
            allowClear: true,
            width: '100%'
        });

    } catch (error) {

        console.error("Office API Error:", error);

    }
}

fetchOffices();


// Print Preview button animation 
document.querySelectorAll(".print-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        this.classList.add("loading");

        const icon = this.querySelector("i");

        if (icon) {
            icon.className =
                "fa-solid fa-spinner fa-spin me-1";
        }
    });
});

$('form').on('submit', function () {
    const officeCode = $('#officeSelect').val();
    $('#officeSelect').trigger('change');
});

$('form').on('submit', function () {

    const $form = $(this);

    const $search =
        $('#SearchTerm');

    const $office =
        $('#officeSelect');

    const $date =
        $('#dateRangeFilter');


    // Trim search value
    if ($search.length) {

        $search.val(
            $.trim($search.val())
        );

    }


    // Make sure Select2 value is submitted
    if ($office.length) {

        $office.val(
            $office.val()
        );

    }


    // Do NOT clear SearchTerm
    // Do NOT reset form
    // Do NOT call form.reset()

});