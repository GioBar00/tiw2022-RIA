/**
 * Script for handle login page.
 * Checks if the form is valid and sends the request to the server.
 * After the request, analyzes the response and if it 's valid send a redirect to the home page.
 */
(function () {
    if (localStorage.getItem("user") !== null) {
        window.location.href = "index.html";
    }
    const form = document.getElementById("loginForm");
    const fieldSet = document.getElementById("loginFieldSet");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.checkValidity()) {
            makeCall("POST", 'CheckLogin', function (response) {
                fieldSet.disabled = true;
                if (response.readyState === XMLHttpRequest.DONE) {
                    const message = response.responseText;
                    switch (response.status) {
                        case 200:
                            localStorage.setItem("user", message);
                            window.location.href = "index.html";
                            break;
                        case 400:
                        case 401:
                            document.getElementById("errorMsg").textContent = message;
                            break;
                        case 500:
                            alert(message);
                            break;
                        default:
                            alert(message);
                            break;
                    }
                    fieldSet.disabled = false;
                }
            }, form);
        } else form.reportValidity();
    });
})();