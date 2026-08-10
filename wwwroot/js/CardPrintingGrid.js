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