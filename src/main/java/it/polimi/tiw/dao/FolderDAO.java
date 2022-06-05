package it.polimi.tiw.dao;

import it.polimi.tiw.beans.Folder;
import it.polimi.tiw.beans.SubFolder;

import java.sql.Date;
import java.sql.*;
import java.util.*;

/**
 * This class is the Data Access Object for the Folder.
 */
public class FolderDAO {
    /**
     * {@link Connection} to the database.
     */
    private final Connection connection;

    /**
     * Constructor.
     *
     * @param connection the {@link Connection} to the database.
     */
    public FolderDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * This method checks if a folder exists with the given id and owner.
     *
     * @param id the id of the folder.
     * @return if the folder exists.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean doesFolderExist(int id, int ownerId) throws SQLException {
        String query = "SELECT idfolder FROM folder WHERE idfolder = ? AND user_iduser = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, id);
            statement.setInt(2, ownerId);
            ResultSet resultSet = statement.executeQuery();
            return resultSet.next();
        }
    }

    /**
     * This method checks if a folder exists with the given name and owner.
     *
     * @param name the name of the folder.
     * @return if the folder exists.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean doesFolderWithNameExist(String name, int ownerId) throws SQLException {
        String query = "SELECT idfolder FROM folder WHERE name = ? AND user_iduser = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, name);
            statement.setInt(2, ownerId);
            ResultSet resultSet = statement.executeQuery();
            return resultSet.next();
        }
    }

    /**
     * This method returns the {@link Folder} with the given id.
     *
     * @param id the id of the folder.
     * @return the {@link Folder} with the given id, null if it does not exist.
     * @throws SQLException if an error occurs during the query.
     */
    public Folder getFolder(int id) throws SQLException {
        String query = "SELECT idfolder, name, creationDate, user_iduser FROM folder WHERE idfolder = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, id);
            ResultSet resultSet = statement.executeQuery();
            if (resultSet.next()) {
                return new Folder(resultSet.getInt("idfolder"), resultSet.getString("name"),
                        resultSet.getDate("creationDate"), resultSet.getInt("user_iduser"));
            }
        }
        return null;
    }

    /**
     * This method returns a map of the {@link Folder}s of a specified user with the corresponding {@link SubFolder}s.
     *
     * @param ownerId the id of the owner.
     * @return a map of the {@link Folder}s of a specified user with the corresponding {@link SubFolder}s.
     * @throws SQLException if an error occurs during the query.
     */
    public Map<Folder, List<SubFolder>> getFoldersWithSubFolders(int ownerId) throws SQLException {
        String query = "SELECT * FROM folder f LEFT JOIN subfolder s on f.idfolder = s.folder_idfolder WHERE f.user_iduser = ?";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setInt(1, ownerId);
            ResultSet resultSet = statement.executeQuery();
            Map<Folder, List<SubFolder>> folders = new HashMap<>();
            while (resultSet.next()) {
                int idfolder = resultSet.getInt("idfolder");
                Folder folder;
                Optional<Folder> optionalFolder = folders.keySet().stream().filter(f -> f.id() == idfolder).findFirst();
                if (optionalFolder.isPresent()) {
                    folder = optionalFolder.get();
                } else {
                    folder = new Folder(idfolder, resultSet.getString("f.name"),
                            resultSet.getDate("f.creationDate"), resultSet.getInt("user_iduser"));
                    folders.put(folder, new LinkedList<>());
                }
                SubFolder subFolder = new SubFolder(resultSet.getInt("idsubfolder"), resultSet.getString("s.name"),
                        resultSet.getDate("creationDate"),
                        resultSet.getInt("folder_idfolder"));
                folders.get(folder).add(subFolder);
            }
            return folders;
        }
    }

    /**
     * This method creates a new {@link Folder}.
     *
     * @param name    the name of the folder.
     * @param ownerId the id of the owner.
     * @return if the folder was created.
     * @throws SQLException if an error occurs during the query.
     */
    public boolean createFolder(String name, int ownerId) throws SQLException {
        String query = "INSERT INTO folder (name, creationDate, user_iduser) VALUES (?, ?, ?)";
        try (PreparedStatement statement = connection.prepareStatement(query)) {
            statement.setString(1, name);
            statement.setDate(2, new Date(new java.util.Date().getTime()));
            statement.setInt(3, ownerId);
            return statement.executeUpdate() > 0;
        }
    }

    /**
     * This method checks is the name of the folder is valid.
     *
     * @param name the name of the folder.
     * @return if the name is valid.
     */
    public static boolean checkName(String name) {
        return name != null && name.length() > 0 &&
                name.length() <= 50;
    }
}
