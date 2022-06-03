{

    /**
     * This method checks if the user is logged in.
     */
    window.addEventListener('load', function () {
        if(sessionStorage.getItem("user") == null){
            window.location.href = "login.html";
        }
        else{
            //TODO
            }
    }, false);
}