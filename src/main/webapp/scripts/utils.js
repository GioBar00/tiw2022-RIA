/**
 * This method makes a call to the server.
 * @param method specifies if the method is GET or POST.
 * @param url specifies the url to call.
 * @param formElement specifies the form element to send.
 * @param callBack  specifies the function to call when the call is done
 * @param reset specifies if the form should be reset after the call.
 */
function makeCall(method, url, callBack, formElement, reset = true) {
    sendFormData(method, url, callBack, new FormData(formElement));
    if (formElement != null && reset) {
        formElement.reset();
    }
}

/**
 * This method sends a form data to the server.
 * @param method specifies if the method is GET or POST.
 * @param url specifies the url to call.
 * @param callBack specifies the function to call when the call is done
 * @param formData specifies the form data to send.
 */
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
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/
    );
}

/**
 * This method escapes the html characters.
 * @param unsafe the string we want to escape.
 * @returns {string} the escaped string.
 */
const escapeHtml = (unsafe) => {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}