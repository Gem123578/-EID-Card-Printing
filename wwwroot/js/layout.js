//sidebar toggle
document.addEventListener("DOMContentLoaded", function () {

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-btn");

    if (sidebar && menuBtn) {

        menuBtn.addEventListener("click", function () {

            sidebar.classList.toggle("active");

        });

    }

    //logout button
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", function () {

            Logout();

        });

    }


    // Alert Confirm Button

    const confirmBtn =
        document.getElementById("globalAlertConfirmBtn");

    if (confirmBtn) {

        confirmBtn.addEventListener("click", function () {

            if (typeof currentConfirmCallback === "function") {

                const callback = currentConfirmCallback;

                closeAppAlert();

                callback();

            } else {

                closeAppAlert();

            }

        });

    }

});


// ========================================
// Global Alert
// ========================================

let currentConfirmCallback = null;


function showAppAlert(options = {}) {

    const {
        title = "Message",
        message = "",
        type = "info",
        confirmText = "OK",
        cancelText = "Cancel",
        showCancel = false,
        confirmClass = "",
        onConfirm = null,
        onCancel = null
    } = options;


    const modal =
        document.getElementById("globalAlertModal");

    const confirmBtn =
        document.getElementById("globalAlertConfirmBtn");

    const cancelBtn =
        document.getElementById("globalAlertCancelBtn");

    const icon =
        document.getElementById("globalAlertIcon");

    const titleElement =
        document.getElementById("globalAlertTitle");

    const messageElement =
        document.getElementById("globalAlertMessage");


    if (
        !modal ||
        !confirmBtn ||
        !cancelBtn ||
        !icon ||
        !titleElement ||
        !messageElement
    ) {

        console.error(
            "Global Alert elements not found."
        );

        return;
    }


    // ========================================
    // Store callback
    // ========================================

    currentConfirmCallback = onConfirm;


    // ========================================
    // Text
    // ========================================

    titleElement.textContent = title;

    messageElement.textContent = message;

    confirmBtn.textContent = confirmText;

    cancelBtn.textContent = cancelText;


    // ========================================
    // Confirm Button
    // ========================================

    confirmBtn.className =
        "app-alert-btn app-alert-btn-confirm";

    if (confirmClass) {

        confirmBtn.classList.add(confirmClass);

    }


    // ========================================
    // Icons
    // ========================================

    const icons = {

        info: {
            icon: "fa-solid fa-circle-info",
            class: "icon-info"
        },

        success: {
            icon: "fa-solid fa-circle-check",
            class: "icon-success"
        },

        warning: {
            icon: "fa-solid fa-triangle-exclamation",
            class: "icon-warning"
        },

        error: {
            icon: "fa-solid fa-circle-xmark",
            class: "icon-error"
        },

        confirmation: {
            icon: "fa-solid fa-circle-question",
            class: "icon-confirmation"
        }

    };


    const selected =
        icons[type] || icons.info;


    icon.className = "app-alert-icon";

    icon.innerHTML =
        `< i class="${selected.icon}" ></i > `;

    icon.classList.add(selected.class);


    // ========================================
    // Cancel Button
    // ========================================

    cancelBtn.style.display =
        showCancel ? "inline-flex" : "none";


    cancelBtn.onclick = function () {

        if (typeof onCancel === "function") {

            onCancel();

        }

        closeAppAlert();

    };


    // ========================================
    // Show Modal
    // ========================================

    modal.classList.add("is-visible");

}


// ========================================
// Close Alert
// ========================================

function closeAppAlert() {

    const modal =
        document.getElementById("globalAlertModal");

    if (modal) {

        modal.classList.remove("is-visible");

    }

    currentConfirmCallback = null;

}


// ========================================
// Logout
// ========================================

function Logout() {

    const logoutBtn =
        document.getElementById("logoutBtn");

    const logoutUrl =
        logoutBtn?.dataset.logoutUrl || "/Home/Logout";


    showAppAlert({

        title: "Logout Confirmation",

        type: "confirmation",

        message: "Are you sure you want to logout?",

        confirmText: "Yes",

        cancelText: "No",

        showCancel: true,

        onConfirm: function () {

            window.location.href = logoutUrl;

        }

    });

}
