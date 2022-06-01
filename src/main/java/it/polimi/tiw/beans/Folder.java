package it.polimi.tiw.beans;

import java.sql.Date;

/**
 * This class is the bean for a folder.
 * @param id the id of the folder.
 * @param name the name of the folder.
 * @param creationDate the creation date of the folder.
 * @param ownerId the id of the owner of the folder.
 */
public record Folder(int id, String name, Date creationDate, int ownerId) {
}
