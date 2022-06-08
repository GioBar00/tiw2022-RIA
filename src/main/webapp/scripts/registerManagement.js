(function () {
    const form = document.getElementById("registerForm");
    const fieldSet = document.getElementById("registerFieldSet");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (form.checkValidity()) {
            if (document.getElementById("password").textContent === document.getElementById("confirmPassword").textContent) {
                if (checkEmail(document.getElementById("email").textContent)) {
                    makeCall("POST", 'register', function (response) {
                        fieldSet.disabled = true;
                        if (response.readyState === XMLHttpRequest.DONE) {
                            const message = response.responseText;
                            switch (response.status) {
                                case 200 :
                                    window.location.href = "login.html";
                                    break;
                                case 403:
                                    document.getElementById("errorMsg").textContent = message;
                                    break;
                                case 400:
                                case 500:
                                    alert(message);
                                    break;
                                default:
                                    alert();
                            }
                            fieldSet.disabled = false;
                        }
                    }, form, false);
                } else {
                    document.getElementById("errorMsg").textContent = "Email is not valid";
                }
            } else {
                document.getElementById("errorMsg").textContent = "Passwords do not match";
            }

        } else form.reportValidity();
    }, false);
})();