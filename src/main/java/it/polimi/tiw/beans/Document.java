package it.polimi.tiw.beans;

import java.sql.Date;

/**
 * This class is the bean for a document.
 * @param id the id of the document.
 * @param name the name of the document.
 * @param format the format of the document.
 * @param summary the summary of the document.
 * @param creationDate the creation date of the document.
 * @param subFolderId the id of the subfolder of the document.
 */
public record Document(int id, String name, String owner, String format, String summary, Date creationDate, int subFolderId) {

}
