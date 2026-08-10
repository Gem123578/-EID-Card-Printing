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
            document.getElementById('officeSelect');

        officeSelect.innerHTML =
            '<option value="">-- Office Stations ရွေးပါ --</option>';

        data.offices.forEach(function (office) {

            const option = document.createElement("option");

            option.value = office.station_code;
            option.textContent = office.station_name;

            officeSelect.appendChild(option);

        });

    } catch (error) {

        console.error("Office API Error:", error);

    }
}

fetchOffices();

// Print Preview button animation 
document.querySelectorAll(".print-btn").forEach(function (button)
{
    button.addEventListener("click", function ()
    {
        this.classList.add("loading");
        const icon = this.querySelector("i");
        if (icon) { icon.className = "fa-solid fa-spinner fa-spin me-1"; }
    });
});

