package it.polimi.tiw.records;

import it.polimi.tiw.beans.Document;
import it.polimi.tiw.beans.SubFolder;

import java.util.List;

public record SubFolderAndDocuments(SubFolder subFolder, List<Document> documentList) {
}
