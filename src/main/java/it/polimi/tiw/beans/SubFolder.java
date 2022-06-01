package it.polimi.tiw.beans;

import java.sql.Date;

/**
 * This class is the bean for a subfolder.
 * @param id the id of the subfolder.
 * @param name the name of the subfolder.
 * @param creationDate the creation date of the subfolder.
 * @param folderId the id of the folder of the subfolder.
 */
public record SubFolder(int id, String name, Date creationDate, int folderId) {
}
