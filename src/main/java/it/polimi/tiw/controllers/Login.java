package it.polimi.tiw.controllers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.UserDAO;
import it.polimi.tiw.utils.ConnectionHandler;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serial;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * This class is the controller for the login page.
 */
@WebServlet("/CheckLogin")
@MultipartConfig
public class Login extends HttpServlet {
    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * {@link Connection} to the database.
     */
    private Connection connection;


    /**
     * Initialize the {@link Connection} to the database.
     *
     * @throws ServletException if the {@link Connection} to the database cannot be initialized.
     */
    @Override
    public void init() throws ServletException {
        ServletContext context = getServletContext();
        connection = ConnectionHandler.getConnection(context);
    }

    /**
     * Checks if the user is logged in.
     *
     * @param request  an {@link HttpServletRequest} object that
     *                 contains the request the client has made
     *                 of the servlet
     * @param response an {@link HttpServletResponse} object that
     *                 contains the response the servlet sends
     *                 to the client
     * @throws IOException if an input or output error is
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (request.getSession().getAttribute("user") != null) {
            sendUser(response, (User) request.getSession().getAttribute("user"));
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().println("You are not logged in.");
        }
    }

    /**
     * Checks the credentials of the user.
     *
     * @param req  an {@link HttpServletRequest} object that
     *             contains the request the client has made
     *             of the servlet
     * @param resp an {@link HttpServletResponse} object that
     *             contains the response the servlet sends
     *             to the client
     * @throws IOException if an input or output error occurs
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String identifier = req.getParameter("username");
        String password = req.getParameter("password");

        if (identifier == null || identifier.isEmpty() || password == null || password.isEmpty()) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().println("Username or password cannot be empty");
            return;
        }

        UserDAO userDAO = new UserDAO(connection);
        User user = null;
        try {
            if (UserDAO.isValidEmail(identifier) && userDAO.doesEmailExist(identifier)) {
                user = userDAO.checkEmailCredentials(identifier, password);
            } else if (UserDAO.isValidUsername(identifier) && userDAO.doesUsernameExist(identifier)) {
                user = userDAO.checkUsernameCredentials(identifier, password);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().println("Error while checking credentials");
            return;
        }

        if (user == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().println("Username or password incorrect");
            return;
        }

        req.getSession().setAttribute("user", user);

        sendUser(resp, user);
    }

    /**
     * Sends the user to the client.
     *
     * @param resp {@link HttpServletResponse} object that contains the response the servlet sends to the client
     * @param user {@link User} object that contains the user
     * @throws IOException if an input or output error occurs
     */
    private void sendUser(HttpServletResponse resp, User user) throws IOException {
        Gson gson = new GsonBuilder().setDateFormat("dd MMM yyyy").create();
        String json = gson.toJson(user);
        resp.setStatus(HttpServletResponse.SC_OK);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().println(json);
    }

    /**
     * Close the {@link Connection} to the database.
     */
    @Override
    public void destroy() {
        try {
            ConnectionHandler.closeConnection(connection);
        } catch (SQLException ignored) {
        }
    }
}
