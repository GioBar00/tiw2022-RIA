package it.polimi.tiw.beans;

/**
 * This class is the bean for the user.
 * @param id the id of the user.
 * @param username the username of the user.
 *                 The username is unique.
 * @param email the email of the user.
 *              The email is unique.
 * @param name the name of the user.
 * @param surname the surname of the user.
 */
public record User(int id, String username, String email, String name, String surname) {
}
