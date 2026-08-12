let printStarted = false;

document
    .getElementById("printCardBtn")
    .addEventListener("click", function () {

        printStarted = true;

        window.print();
    });


window.addEventListener("afterprint", function () {

    if (!printStarted) {
        return;
    }

    printStarted = false;

    markCardAsPrinted();
});


async function markCardAsPrinted() {

    try {

        const response = await fetch(
            markPrintedUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    application_ids: [applicantId]
                })

            }
        );

        console.log("Status =", response.status);

        if (!response.ok) {

            const errorText = await response.text();

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const result = await response.json();
        showAppAlert({
            title: "Print Successful",
            message: "The card has been printed successfully.",
            type: "success",
            confirmText: "OK",
            showCancel: false
        });

    }
    catch (error) {

        console.error(
            "Mark Printed Error:",
            error
        );
    }
}

