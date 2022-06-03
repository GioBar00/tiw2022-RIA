package it.polimi.tiw.enums;

/**
 * Enum of the errors of the register page.
 */
public enum RegisterError {
    INVALID_USERNAME("Username is not valid"),
    INVALID_EMAIL("Email is not valid"),
    INVALID_PASSWORD("Password is not valid"),
    INVALID_NAME("Name is too long"),
    INVALID_SURNAME("Surname is too long"),
    USERNAME_NOT_AVAILABLE("Username is already taken"),
    EMAIL_ALREADY_USED("Email is already used"),
    PASSWORD_MISMATCH("Passwords do not match");

    private String message;
    RegisterError(String message){
        this.message = message;
    }

    public String getMessage(){
        return message;
    }
    /**
     * Returns the {@link RegisterError} corresponding to the given ordinal or null if the ordinal is invalid.
     * @param ordinal the ordinal of the {@link RegisterError}
     * @return the {@link RegisterError} corresponding to the given ordinal or null if the ordinal is invalid.
     */
    public static RegisterError fromOrdinal(int ordinal) {
        if (ordinal < 0 || ordinal >= values().length)
            return null;
        return values()[ordinal];
    }
}
