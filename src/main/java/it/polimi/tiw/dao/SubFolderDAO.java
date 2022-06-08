package it.polimi.tiw.dao;

import it.polimi.tiw.beans.Document;
import it.polimi.tiw.beans.SubFolder;
import it.polimi.tiw.beans.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * This class is the Data Access Object for the SubFolder.
 */
public class SubFolderDAO {

    /**
     * {@link Connection} to the database
     */
    private final Connection connection;

    /**
     * Constructor
     *
     * @param connection the {@link Connection} to the database.
     */
    public SubFolderDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * This method checks if the name could be valid
     *
     * @return true the name could be valid, false otherwise
     */
    public static boolean checkName(String name) {
        return name != null && name.length() > 0 &&
                name.length() <= 50;
    }

    /**
     * This method checks if the user has the right on a subFolder.
     *
     * @param userId      the id of the user.
     * @param subFolderId the id of the document.
     * @return true if the user is the owner of the document. False otherwise.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean checkOwner(int userId, int subFolderId) throws SQLException {
        String query = "SELECT u.iduser FROM (subfolder s INNER JOIN folder f ON s.folder_idfolder = f.idfolder) INNER JOIN user u ON u.iduser = f.user_iduser WHERE s.idsubfolder = ? AND u.iduser = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, subFolderId);
            statement.setInt(2, userId);
            ResultSet resultSet = statement.executeQuery();

            return resultSet.next();

        }
    }

    /**
     * This method create a new {@link it.polimi.tiw.beans.SubFolder} in the database.
     *
     * @param name         the name of the subfolder.
     * @param creationDate the date of the creation.
     * @param folderID     the id of the {@link it.polimi.tiw.beans.Folder} that contains the new {@link it.polimi.tiw.beans.SubFolder}
     * @return true if the subFolder has been inserted, false otherwise.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean createSubFolder(String name, Date creationDate, int folderID) throws SQLException {
        String query = "INSERT INTO subfolder(name, creationDate, folder_idfolder) VALUES (?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, name);
            statement.setDate(2, creationDate);
            statement.setInt(3, folderID);

            return statement.executeUpdate() > 0;
        }
    }

    /**
     * This method delete a {@link SubFolder} from the database.
     *
     * @param subFolderId the id of the {@link SubFolder} to delete.
     * @return true if the {@link SubFolder} has been deleted, false otherwise.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean deleteSubFolder(int subFolderId) throws SQLException {
        String query = "DELETE FROM subfolder WHERE idsubfolder = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, subFolderId);
            return statement.executeUpdate() > 0;
        }
    }
}
