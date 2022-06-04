package it.polimi.tiw.beans;

import java.util.List;

public class FolderAndSubFolders {

    private final Folder folder;

    private final List<SubFolderAndDocuments> subFolderAndDocumentsList;

    public FolderAndSubFolders(Folder folder, List<SubFolderAndDocuments> subFolderAndDocumentsList) {
        this.folder = folder;
        this.subFolderAndDocumentsList = subFolderAndDocumentsList;
    }
}
