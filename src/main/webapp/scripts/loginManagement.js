/**
 * Script for handle login page.
 * Checks if the form is valid and sends the request to the server.
 * After the request, analyzes the response and if it 's valid send a redirect to the home page.
 */
(function () {
    document.getElementById("loginBtn").addEventListener("click", function (e) {
        const form = e.target.closest("form");
        if (form.checkValidity()) {
            makeCall("POST", 'CheckLogin', function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    const message = response.responseText;
                    switch (response.status) {
                        case 200:
                            sessionStorage.setItem("user", message);
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
                }
            }, form);
        } else form.reportValidity();
    });
})();