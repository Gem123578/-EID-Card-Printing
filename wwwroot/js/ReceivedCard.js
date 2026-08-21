document.addEventListener("DOMContentLoaded", function () {

    const qrInput = document.getElementById("qrInput");
    const message = document.getElementById("message");

    // Element မတွေ့ရင် JS မဆက်လုပ်ပါနဲ့
    if (!qrInput) {
        console.error("qrCode input not found.");
        return;
    }

    qrInput.focus();

    qrInput.addEventListener("keydown", async function (event) {

        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        const qrCode = qrInput.value.trim();

        if (!qrCode) {
            showMessage(
                "QR Code ထည့်ပေးပါ။",
                "danger"
            );
            return;
        }

        await scanQRCode(qrCode);
    });


    async function scanQRCode(qrCode) {

        try {

            showMessage(
                "QR Code စစ်ဆေးနေပါသည်...",
                "info"
            );

            const response = await fetch(
                "/IssuedCard/ScanReceiveQRCode",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        QRcode: qrCode
                    })
                }
            );

            const result = await response.json();

            console.log("API Response:", result);

            if (response.ok && result.success) {

                showMessage(
                    result.message ?? "Card လက်ခံပြီးပါပြီ။",
                    "success"
                );

            } else {

                showMessage(
                    result.message ?? "လုပ်ဆောင်မှု မအောင်မြင်ပါ။",
                    "danger"
                );
            }

        }
        catch (error) {

            console.error("Receive Card Error:", error);

            showMessage(
                "Server နှင့် ချိတ်ဆက်၍ မရပါ။",
                "danger"
            );

        }
        finally {

            qrInput.value = "";
            qrInput.focus();
        }
    }


    function showMessage(text, type) {

        if (!message) {
            console.log(text);
            return;
        }

        message.innerHTML = `
            <div class="alert alert-${type}">
                ${text}
            </div>
        `;
    }

});