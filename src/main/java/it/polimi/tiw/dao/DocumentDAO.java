package it.polimi.tiw.dao;

import it.polimi.tiw.beans.Document;
import it.polimi.tiw.beans.SubFolder;

import java.sql.*;

/**
 * This class is the Data Access Object for the Document
 */
public class DocumentDAO {

    /**
     * {@link Connection} to the database
     */
    private final Connection connection;

    /**
     * Constructor
     *
     * @param connection the {@link Connection} to the database.
     */
    public DocumentDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * This method checks if the name could be valid
     *
     * @return true the name could be valid, false otherwise
     */
    public boolean checkName(String name) {
        return (name != null && name.length() > 0 && name.length() <= 50);
    }

    /**
     * This method checks if the format is valid
     *
     * @return true the format is valid, false otherwise
     */
    public boolean checkFormat(String format) {
        return (format != null && format.length() > 0 && format.length() <= 10);
    }

    /**
     * This method checks if the summary is valid
     *
     * @return true the summary is valid, false otherwise
     */
    public boolean checkSummary(String summary) {
        return (summary != null && summary.length() > 0 && summary.length() <= 200);
    }

    public boolean doesDocumentExists() {
        //TODO
        return false;
    }

    /**
     * This method checks if the user has the right on a document.
     *
     * @param userId     the id of the user.
     * @param documentId the id of the document.
     * @return true if the user is the owner of the document. False otherwise.
     * @throws SQLException if an error occurs during the query
     */
    public boolean checkOwner(int userId, int documentId) throws SQLException {
        String query = "SELECT user_iduser FROM (document d INNER JOIN subfolder s ON d.subfolder_idsubfolder = s.idsubfolder) INNER JOIN folder f ON s.folder_idfolder = f.idfolder WHERE iddocument = ? AND user_iduser = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, String.valueOf(documentId));
            statement.setString(2, String.valueOf(userId));
            ResultSet resultSet = statement.executeQuery();

            return resultSet.next();

        }
    }

    /**
     * This method returns a document.
     *
     * @param documentId the id of the document.
     * @return the {@link Document}
     * @throws SQLException if an error occurs during the query
     */
    public Document getDocument(int documentId) throws SQLException {
        String query = "SELECT * FROM document WHERE iddocument = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, documentId);
            ResultSet resultSet = statement.executeQuery();

            if (!resultSet.isBeforeFirst())
                return null;
            resultSet.next();
            return new Document(resultSet.getInt("iddocument"),
                    resultSet.getString("name"),
                    findOwner(documentId),
                    resultSet.getString("format"),
                    resultSet.getString("summary"),
                    resultSet.getDate("creationDate"),
                    resultSet.getInt("subfolder_idsubfolder")
            );
        }
    }

    /**
     * This method returns the owner of a document
     * @param documentId the id of the document.
     * @return the username of the owner
     * @throws SQLException if an error occurs during the query
     */
    private String findOwner(int documentId) throws SQLException {
        String query = "SELECT u.username FROM ((document d INNER JOIN subfolder s ON d.subfolder_idsubfolder = s.idsubfolder) INNER JOIN folder f ON s.folder_idfolder = f.idfolder) INNER JOIN user u ON f.user_iduser = u.iduser WHERE iddocument = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, documentId);
            ResultSet resultSet = statement.executeQuery();

            resultSet.next();
            return resultSet.getString("username");

        }

    }

    /**
     * This method returns the {@link SubFolder} that contains the specified document.
     *
     * @param documentId the id of the document.
     * @return {@link SubFolder}.
     * @throws SQLException if an error occurs during the query.
     */
    public SubFolder getSubFolder(String documentId) throws SQLException {
        String query = "SELECT * FROM  (subfolder s LEFT JOIN document d ON d.subfolder_idsubfolder = s.idsubfolder)WHERE iddocument = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, Integer.parseInt(documentId));
            ResultSet resultSet = statement.executeQuery();

            if (!resultSet.isBeforeFirst())
                return null;
            resultSet.next();
            return new SubFolder(resultSet.getInt("idsubfolder"),
                    resultSet.getString("name"),
                    resultSet.getDate("creationDate"),
                    resultSet.getInt("folder_idfolder"));
        }
    }


    /**
     * This method moves a {@link Document} to a specified {@link SubFolder}.
     *
     * @param documentId  the id of the {@link Document}.
     * @param subFolderId the id of the {@link SubFolder}.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean moveDocument(int documentId, int subFolderId) throws SQLException {
        String query = "UPDATE document SET subfolder_idsubfolder = ? WHERE iddocument = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, subFolderId);
            statement.setInt(2, documentId);
            return statement.executeUpdate() > 0;
        }
    }

    /**
     * This method insert into the database a new {@link Document}.
     *
     * @param name        the name of the document.
     * @param format      the format of the document.
     * @param summary     the summary of the document.
     * @param subFolderId the id of the subFolder.
     * @return true if the document has been inserted, false otherwise.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean createDocument(String name, String format, String summary, int subFolderId) throws SQLException {
        String query = "INSERT INTO document (name, format, summary, creationDate, subfolder_idsubfolder) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, name);
            statement.setString(2, format);
            statement.setString(3, summary);
            statement.setDate(4, new Date(new java.util.Date().getTime()));
            statement.setInt(5, subFolderId);

            return statement.executeUpdate() > 0;
        }
    }
}
