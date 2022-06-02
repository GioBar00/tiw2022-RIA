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
    if (formElement !== null && reset) {
        formElement.reset();
    }
}