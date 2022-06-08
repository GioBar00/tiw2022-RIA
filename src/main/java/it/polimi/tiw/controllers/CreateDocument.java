package it.polimi.tiw.controllers;

import it.polimi.tiw.beans.Document;
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

@WebServlet("/create-document")
@MultipartConfig
public class CreateDocument extends HttpServlet {
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
     * Manages the creation of a {@link Document}
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
        String name = request.getParameter("docName");
        String format = request.getParameter("docFormat");
        String summary = request.getParameter("docSummary");
        String subFolderId = request.getParameter("subfolderId");

        if (name == null || name.isEmpty() || format == null || format.isEmpty() || summary == null || summary.isEmpty() || subFolderId == null || subFolderId.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The data cannot be empty");
            return;
        }

        if (!InputValidator.isInt(subFolderId, response))
            return;

        name = name.trim();
        format = format.trim();
        summary = summary.trim();
        int subFolderIdInt = Integer.parseInt(subFolderId);

        SubFolderDAO subFolderDAO = new SubFolderDAO(this.connection);
        DocumentDAO documentDAO = new DocumentDAO(this.connection);
        User user = (User) request.getSession().getAttribute("user");

        try {
            if (subFolderDAO.checkOwner(user.id(), subFolderIdInt))
                if (DocumentDAO.checkName(name) && DocumentDAO.checkFormat(format) && DocumentDAO.checkSummary(summary)) {
                    if (documentDAO.createDocument(name, format, summary, subFolderIdInt)) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        return;
                    }
                }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("The data is not valid");
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
