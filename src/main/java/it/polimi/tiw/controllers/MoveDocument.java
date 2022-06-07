package it.polimi.tiw.controllers;

import it.polimi.tiw.beans.Document;
import it.polimi.tiw.beans.SubFolder;
import it.polimi.tiw.beans.User;
import it.polimi.tiw.dao.DocumentDAO;
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
import java.sql.SQLException;

@WebServlet("/move-document")
@MultipartConfig
public class MoveDocument extends HttpServlet {

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
     * This method processes the request of moving a {@link Document} to a {@link SubFolder}
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
        String selectedSubFolder = request.getParameter("subFolderId");
        String documentId = request.getParameter("documentId");

        if (selectedSubFolder == null || documentId == null || selectedSubFolder.isEmpty() || documentId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Not valid subfolder or document");
            return;
        }


        if (!InputValidator.isInt(selectedSubFolder, response) || !InputValidator.isInt(documentId, response))
            return;

        int subFolderId = Integer.parseInt(selectedSubFolder);
        int documentIdInt = Integer.parseInt(documentId);

        DocumentDAO documentDAO = new DocumentDAO(this.connection);
        SubFolderDAO subFolderDAO = new SubFolderDAO(this.connection);
        User user = (User) request.getSession().getAttribute("user");

        try {
            if (subFolderDAO.checkOwner(user.id(), subFolderId)) {
                if (documentDAO.checkOwner(user.id(), documentIdInt)) {
                    if (documentDAO.moveDocument(documentIdInt, subFolderId)) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        return;
                    }
                }
            }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Not valid subfolder or document");
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
