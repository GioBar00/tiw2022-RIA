package it.polimi.tiw.dao;

import it.polimi.tiw.beans.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * This class is the Data Access Object for the User.
 */
public class UserDAO {
    /**
     * {@link Connection} to the database.
     */
    private final Connection connection;

    /**
     * Constructor.
     * @param connection the {@link Connection} to the database.
     */
    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * This method checks if the username and the password are correct and returns the {@link User} if they are.
     * @param username the username of the user.
     * @param password the password of the user.
     * @return the {@link User} if the username and the password are correct.
     * @throws SQLException if an error occurs during the query.
     */
    public User checkUsernameCredentials(String username, String password) throws SQLException {
        String query = "SELECT iduser, username, email, name, surname FROM user WHERE username = ? AND password = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, username);
            statement.setString(2, password);
            return getUser(statement);
        }
    }

    /**
     * This method checks if the email and the password are correct and returns the {@link User} if they are.
     * @param email the email of the user.
     * @param password the password of the user.
     * @return the {@link User} if the email and the password are correct.
     * @throws SQLException if an error occurs during the query.
     */
    public User checkEmailCredentials(String email, String password) throws SQLException {
        String query = "SELECT iduser, username, email, name, surname FROM user WHERE email = ? AND password = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            statement.setString(2, password);
            return getUser(statement);
        }
    }

    /**
     * This method returns the user if the credentials are correct otherwise it returns null.
     * @param statement the statement to execute.
     * @return the user if the credentials are correct otherwise it returns null.
     * @throws SQLException if an error occurs during the execution of the statement.
     */
    private User getUser(PreparedStatement statement) throws SQLException {
        try (ResultSet resultSet = statement.executeQuery()) {
            if (!resultSet.isBeforeFirst())
                return null;
            resultSet.next();
            return new User(resultSet.getInt("iduser"),
                    resultSet.getString("username"),
                    resultSet.getString("email"),
                    resultSet.getString("name"),
                    resultSet.getString("surname"));
        }
    }

    /**
     * This method returns if a user with the given username exists.
     * @param username the username of the user.
     * @return if a user with the given username exists.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean doesUsernameExist(String username) throws SQLException {
        String query = "SELECT iduser, username, email, name, surname FROM user WHERE username = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, username);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.isBeforeFirst();
            }
        }
    }

    /**
     * This method returns if a user with the given email exists.
     * @param email the email of the user.
     * @return if a user with the given email exists.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean doesEmailExist(String email) throws SQLException {
        String query = "SELECT iduser, username, email, name, surname FROM user WHERE email = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, email);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.isBeforeFirst();
            }
        }
    }

    /**
     * This method inserts a new user in the database.
     * @param username the username of the user.
     * @param email the email of the user.
     * @param name the name of the user.
     * @param surname the surname of the user.
     * @param password the password of the user.
     * @return the id of the user.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean addUser(String username, String email, String name, String surname, String password) throws SQLException {
        String query = "INSERT INTO user (username, email, password, name, surname) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, username);
            statement.setString(2, email);
            statement.setString(3, password);
            statement.setString(4, name);
            statement.setString(5, surname);
            return statement.executeUpdate() > 0;
        }
    }

    /**
     * This method checks if the username is valid.
     * @param username the username to check.
     * @return true if the username is valid, false otherwise.
     */
    public static boolean isValidUsername(String username) {
        return username.matches("[a-zA-Z\\d]{3,20}$");
    }

    /**
     * This method checks if the email is valid.
     * @param email the email to check.
     * @return true if the email is valid, false otherwise.
     */
    public static boolean isValidEmail(String email) {
        return email.matches("^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}])|(([a-zA-Z\\-\\d]+\\.)+[a-zA-Z]{2,}))$")
                && email.length() <= 50;
    }

    /**
     * This method checks if the password is valid.
     * @param password the password to check.
     * @return true if the password is valid, false otherwise.
     */
    public static boolean isValidPassword(String password) {
        //return password.matches("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&.])[A-Za-z\\d@$!%*#?&.]{8,}$" && password.length() <= 50;
        return true;
    }

    /**
     * This method checks if the name is valid.
     * @param name the name to check.
     * @return true if the name is valid, false otherwise.
     */
    public static boolean isValidName(String name) {
        return name.matches("[a-zA-Z\\s'èéòàù]{3,20}$");
    }

    /**
     * This method checks if the surname is valid.
     * @param surname the surname to check.
     * @return true if the surname is valid, false otherwise.
     */
    public static boolean isValidSurname(String surname) {
        return surname.matches("[a-zA-Z\\s'èéòàù]{3,20}$");
    }
}
