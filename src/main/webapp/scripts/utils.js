/**
 * This method makes a call to the server.
 * @param method specifies if the method is GET or POST.
 * @param url specifies the url to call.
 * @param formElement specifies the form element to send.
 * @param callBack  specifies the function to call when the call is done
 * @param reset specifies if the form should be reset after the call.
 */
function makeCall(method, url, callBack, formElement, reset = true) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        callBack(request);
    };
    request.open(method, url);
    if (formElement != null) {
        request.send(new FormData(formElement));
    } else {
        request.send();
    }
    if (formElement != null && reset) {
        formElement.reset();
    }
}

function sendFormData(method, url, callBack, formData) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        callBack(request);
    };
    request.open(method, url);
    if (formData != null) {
        request.send(formData);
    } else {
        request.send();
    }
}

/**
 * This method check if an email is valid.
 * @param email the email we want to check.
 * @returns {*} true if the email is valid, false otherwise.
 */
function checkEmail(email) {
    return email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}