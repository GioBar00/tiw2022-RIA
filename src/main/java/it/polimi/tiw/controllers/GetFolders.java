package it.polimi.tiw.controllers;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import it.polimi.tiw.beans.*;
import it.polimi.tiw.dao.FolderDAO;
import it.polimi.tiw.records.FolderAndSubFolders;
import it.polimi.tiw.records.SubFolderAndDocuments;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * This class is the controller for the home page.
 */
@WebServlet("/GetFolders")
@MultipartConfig
public class GetFolders extends HttpServlet {
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
     * Sends to the client a Json that contains all the data required.
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
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = (User) req.getSession().getAttribute("user");
        String sessionUser = user.username();
        if (sessionUser != null) {
            FolderDAO folderDAO = new FolderDAO(connection);
            try {
                Map<Folder, Map<SubFolder, List<Document>>> folders = folderDAO.getFoldersWithSubFoldersAndDocuments(user.id());

                List<FolderAndSubFolders> view = new ArrayList<>(folders.keySet().size());

                for (Folder folder : folders.keySet()) {
                    List<SubFolderAndDocuments> subFolders = new ArrayList<>(folders.get(folder).keySet().size());
                    for (SubFolder subFolder : folders.get(folder).keySet()) {
                        subFolders.add(new SubFolderAndDocuments(subFolder, folders.get(folder).get(subFolder)));
                    }
                    view.add(new FolderAndSubFolders(folder, subFolders));
                }

                Gson gson = new GsonBuilder().setDateFormat("dd MMM yyyy").create();
                String json = gson.toJson(view);

                resp.setContentType("application/json");
                resp.setCharacterEncoding("UTF-8");
                resp.getWriter().write(json);

            } catch (SQLException e) {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().println("Internal server error");
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
        }
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
