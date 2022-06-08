package it.polimi.tiw.controllers;

import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.FolderDAO;
import it.polimi.tiw.dao.SubFolderDAO;
import it.polimi.tiw.utils.ConnectionHandler;
import it.polimi.tiw.utils.InputValidator;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;

@WebServlet("/create-subfolder")
@MultipartConfig
public class CreateSubFolder extends HttpServlet {

    /**
     * {@link Connection} to the database
     */
    private Connection connection;


    /**
     * Initializes the {@link Connection} to the database.
     *
     * @throws ServletException if the {@link Connection} to the database cannot be initialized.
     */
    @Override
    public void init() throws ServletException {
        ServletContext context = getServletContext();
        connection = ConnectionHandler.getConnection(context);
    }

    /**
     * Manages the creation of a new {@link it.polimi.tiw.beans.SubFolder}
     *
     * @param request  an {@link HttpServletRequest} object that
     *                 contains the request the client has made
     *                 of the servlet
     * @param response an {@link HttpServletResponse} object that
     *                 contains the response the servlet sends
     *                 to the client
     * @throws IOException if an input or output error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String folderId = request.getParameter("folderId");
        String subFolder = request.getParameter("subFolderName");

        if (folderId == null || folderId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The folderId cannot be empty");
            return;
        }
        if (subFolder == null || subFolder.isEmpty() || !SubFolderDAO.checkName(subFolder)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The subfolder name is not valid.");
            return;
        }

        if (!InputValidator.isInt(folderId, response))
            return;
        int id = Integer.parseInt(folderId);

        FolderDAO folderDAO = new FolderDAO(this.connection);
        User user = (User) request.getSession().getAttribute("user");
        try {
            if (folderDAO.checkOwner(id, user.id())) {
                SubFolderDAO subFolderDAO = new SubFolderDAO(this.connection);
                if (subFolderDAO.createSubFolder(subFolder, new Date(new java.util.Date().getTime()), id)) {
                    response.setStatus(HttpServletResponse.SC_OK);
                } else {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    response.getWriter().println("Subfolder could not be created.");
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Error while processing the request");
        }
    }

    /**
     * Closes the {@link Connection} to the database
     */
    @Override
    public void destroy() {
        try {
            ConnectionHandler.closeConnection(connection);
        } catch (SQLException ignored) {
        }
    }
}
