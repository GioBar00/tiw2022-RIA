package it.polimi.tiw.utils;

import it.polimi.tiw.enums.ContextParameters;

import javax.servlet.ServletContext;
import javax.servlet.UnavailableException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * This class is the handler for the connection to the database.
 */
public abstract class ConnectionHandler {

    /**
     * This method returns the {@link Connection} to the database.
     * @param context the {@link ServletContext} of the {@link javax.servlet.Servlet}.
     * @return the {@link Connection} to the database.
     * @throws UnavailableException if the {@link Connection} to the database cannot be initialized.
     */
    public static Connection getConnection(ServletContext context) throws UnavailableException {
        try {
            String dbDriver = context.getInitParameter(ContextParameters.DB_DRIVER.getValue());
            String dbUrl = context.getInitParameter(ContextParameters.DB_URL.getValue());
            String dbUser = context.getInitParameter(ContextParameters.DB_USER.getValue());
            String dbPassword = context.getInitParameter(ContextParameters.DB_PASSWORD.getValue());
            Class.forName(dbDriver);
            return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        } catch (ClassNotFoundException e) {
            throw new UnavailableException("Can't load database driver");
        } catch (SQLException e) {
            throw new UnavailableException("Can't connect to database");
        }
    }

    /**
     * This method closes the {@link Connection} to the database.
     * @param connection the {@link Connection} to close.
     * @throws SQLException if an error occurs while closing the {@link Connection}.
     */
    public static void closeConnection(Connection connection) throws SQLException {
        if (connection != null)
            connection.close();
    }
}
