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

        console.log("URL =", markPrintedUrl);
        console.log("ApplicantId =", applicantId);

        const response = await fetch(
            markPrintedUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    applicantId: applicantId
                })
            }
        );

        console.log("Status =", response.status);

        if (!response.ok) {

            const errorText = await response.text();

            console.error("Server response =", errorText);

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const result = await response.json();


        console.log("Print status:", result);

    }
    catch (error) {

        console.error(
            "Mark Printed Error:",
            error
        );
    }
}

