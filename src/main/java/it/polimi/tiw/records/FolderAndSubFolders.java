package it.polimi.tiw.records;

import it.polimi.tiw.beans.Folder;

import java.util.List;

public record FolderAndSubFolders(Folder folder, List<SubFolderAndDocuments> subFolderAndDocumentsList) {
}
