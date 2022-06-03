(function () {
    document.getElementById("sendSubmit").addEventListener("click", function (e) {
        const form = e.target.closest("form");
        if(form.checkValidity()){
            if(document.getElementById("password").textContent === document.getElementById("confirmPassword").textContent) {
                if (checkEmail(document.getElementById("email").textContent)) {
                    makeCall("POST", 'register',function (response){
                        if(response.readyState === 4){
                            const message = response.responseText;
                            switch(response.status){
                                case 200 :
                                    window.location.href = "login.html";
                                    break;
                                case 400:
                                    document.getElementById("errorMsg").textContent = message;
                                    break;
                                case 500:
                                    alert(message);
                                    break;
                                default:
                                    alert();
                            }
                        }
                    }, form);
                }
                else{
                    document.getElementById("errorMsg").textContent = "Email is not valid";
                }
            }else {
                document.getElementById("errorMsg").textContent = "Passwords do not match";
            }

        }else form.reportValidity();
    }, false);


})();