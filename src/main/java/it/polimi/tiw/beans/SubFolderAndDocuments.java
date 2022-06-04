package it.polimi.tiw.beans;

import java.util.List;

public class SubFolderAndDocuments {
    private final SubFolder subFolder;
    private final List<Document> documentList;
    public SubFolderAndDocuments(SubFolder subFolder, List<Document> documentList) {
        this.subFolder = subFolder;
        this.documentList = documentList;
    }
}
