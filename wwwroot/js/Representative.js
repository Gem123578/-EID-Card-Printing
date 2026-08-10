document.addEventListener('DOMContentLoaded', function () {
    const modalElement = document.getElementById('representativeModal');
    const radioButton = document.getElementById('relationship');

    modalElement.addEventListener('hidden.bs.modal', function () {
        radioButton.checked = false;
    });
});