package it.polimi.tiw.enums;

/**
 * This enum contains all the parameters in the ServletContext.
 */
public enum ContextParameters {
    /**
     * The name of the database driver.
     */
    DB_DRIVER("dbDriver"),
    /**
     * The url of the database.
     */
    DB_URL("dbUrl"),
    /**
     * The user of the database.
     */
    DB_USER("dbUser"),
    /**
     * The password of the database.
     */
    DB_PASSWORD("dbPassword");

    private final String value;

    ContextParameters(String value) {
        this.value = value;
    }

    /**
     * @return the value of the parameter.
     */
    public String getValue() {
        return value;
    }
}
