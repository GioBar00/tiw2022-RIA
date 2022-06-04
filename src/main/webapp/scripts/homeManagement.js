{
    let folderList, documentDetails, createFolder, createSubFolder, createDocument,
        pageOrchestrator = new PageOrchestrator();
    /**
     * This method checks if the user is logged in.
     */
    window.addEventListener('load', function () {
        if (sessionStorage.getItem("user") == null) {
            window.location.href = "login.html";
        } else {
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    }, false);

    function FolderList(container) {
        this.containter = container;

        this.show = function () {
            this.containter.innerHTML = "";
            var self = this;
            makeCall("GET", "GetFolders", function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    var text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.showContent(JSON.parse(text));
                        case 403:
                            //TODO:
                            break;
                        case 500:
                            alert(text);
                            break;
                    }
                }
            });
        };

        this.showContent = function (view) {
            const self = this;
            //create new folder button
            var button = document.createElement("button");
            button.textContent = "Create Folder";
            button.addEventListener("click", function (e) {
                createFolder.enableForm();
            });
            this.containter.appendChild(button);

            view.forEach((folder) => {
                var folderElement = document.createElement("li");
                folderElement.textContent = folder.folder.name;

                //create new subfolder button
                var button = document.createElement("button");
                button.textContent = "Create SubFolder";
                button.setAttribute("folderId", folder.folder.id);
                button.addEventListener("click", function (e) {
                    createSubFolder.enableForm(e.target.getAttribute("folderId"));
                });
                folderElement.appendChild(button);

                if (folder.subFolderAndDocumentsList != null) {
                    var subFolders = document.createElement("ul");
                    folder.subFolderAndDocumentsList.forEach((subFolderAndDocuments) => {
                        var subFolderElement = document.createElement("li");
                        subFolderElement.textContent = subFolderAndDocuments.subFolder.name;
                        subFolders.appendChild(subFolderElement);

                        // create new document button
                        var button = document.createElement("button");
                        button.textContent = "Create Document";
                        button.setAttribute("subfolderId", subFolderAndDocuments.subFolder.id);
                        subFolders.appendChild(button);
                        button.addEventListener("click", function (e) {
                            createDocument.enableForm(e.target.getAttribute("subfolderId"));
                        })

                        if (subFolderAndDocuments.documentList != null) {
                            var documents = document.createElement("ul");
                            subFolderAndDocuments.documentList.forEach((doc) => {
                                var documentElement = document.createElement("li");
                                documentElement.textContent = doc.name;
                                documentElement.setAttribute("documentId", doc.id);
                                //show details on click
                                documentElement.addEventListener("click", function (e) {
                                    documentDetails.showDocument(e.target.getAttribute("documentId"));
                                });
                                documents.appendChild(documentElement);
                            });
                            subFolders.appendChild(documents);
                        }
                    });
                    folderElement.appendChild(subFolders);
                }
                self.containter.appendChild(folderElement);
            });

        }
    }

    function ShowDocument(options) {
        this.container = options['container'];
        this.documentName = options['documentName'];
        this.documentOwner = options['documentOwner'];
        this.documentDate = options['documentDate'];
        this.documentFormat = options['documentFormat'];
        this.documentSummary = options['documentSummary'];
        this.button = options['button'];

        this.hide = function () {
            this.container.style.visibility = "hidden";
        };

        this.showDocument = function (documentID) {
            var self = this;
            makeCall("GET", "document?documentId=" + documentID, function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    var text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.setDocumentDetails(JSON.parse(text));
                        case 403:
                            //TODO how we handle this?
                            break;
                        case 500:
                            alert(text);
                            break;
                        default:
                            alert("Unknown error");
                    }
                }
            });

        }

        this.setDocumentDetails = function (doc) {
            pageOrchestrator.hideContent();
            this.container.style.visibility = "visible";
            this.documentName.textContent = doc.name;
            this.documentOwner.textContent = doc.owner;
            this.documentFormat.textContent = doc.format;
            this.documentSummary.textContent = doc.summary;
            this.documentDate.textContent = doc.date;

            this.button.addEventListener("click", function (e) {
                e.target.closest("div").style.visibility = "hidden";
            });
        }
    }

    function CreateFolder(container, button) {
        this.container = container;
        this.button = button;

        this.hide = function () {
            container.style.visibility = "hidden";
        }

        this.enableForm = function () {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");
                if (form.checkValidity()) {
                    makeCall("POST", 'create-folder', function (response) {
                            if (response.readyState === XMLHttpRequest.DONE) {
                                const text = response.responseText;
                                switch (response.status) {
                                    case 200:
                                        pageOrchestrator.refresh();
                                        break;
                                    case 400:
                                        alert(text)
                                        break;
                                    case 500:
                                        alert(text);
                                        break;
                                    default:
                                        alert("Unknown error");
                                        break;
                                }
                            }
                        }
                        , new FormData(form));
                } else form.reportValidity();
            }, false);
        }
    }

    function CreateSubFolder(container, button) {
        this.container = container;
        this.button = button;

        this.hide = function () {
            container.style.visibility = "hidden";
        }

        this.enableForm = function (folderId) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");

                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("folderId", folderId);
                    sendFormData("POST", 'create-subfolder', function (response) {
                        if (response.readyState === XMLHttpRequest.DONE) {
                            const text = response.responseText;
                            switch (response.status) {
                                case 200:
                                    pageOrchestrator.refresh();
                                    break;
                                case 400:
                                    alert(text)
                                    break;
                                case 500:
                                    alert(text);
                                    break;
                                default:
                                    alert("Unknown error");
                                    break;
                            }
                        }
                    }, formData);
                    form.reset();
                } else form.reportValidity();
            }, false);
        }

    }

    function CreateDocument(container, button) {
        this.container = container;
        this.button = button;

        this.hide = function () {
            container.style.visibility = "hidden";
        }

        this.enableForm = function (subfolderId) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";

            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");
                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("subfolderId", subfolderId);
                    sendFormData("POST", 'create-document', function (response) {
                        if (response.readyState === XMLHttpRequest.DONE) {
                            const text = response.responseText;
                            switch (response.status) {
                                case 200:
                                    pageOrchestrator.refresh();
                                    break;
                                case 400:
                                    alert(text)
                                    break;
                                case 500:
                                    alert(text);
                                    break;
                                default:
                                    alert("Unknown error");
                                    break;
                            }
                        }
                    }, formData);
                    form.reset();
                } else form.reportValidity();
            },false);

        }
    }

    function PageOrchestrator() {
        this.start = function () {
            folderList = new FolderList(document.getElementById("folderList"));
            documentDetails = new ShowDocument({
                container: document.getElementById("documentDetails"),
                documentName: document.getElementById("documentName"),
                documentOwner: document.getElementById("documentOwner"),
                documentDate: document.getElementById("documentDate"),
                documentFormat: document.getElementById("documentFormat"),
                documentSummary: document.getElementById("documentSummary"),
                button: document.getElementById("hideDetails")
            });
            createFolder = new CreateFolder(document.getElementById("createFolder"), document.getElementById("createFld"));
            createSubFolder = new CreateSubFolder(document.getElementById("createSubFolder"), document.getElementById("createSubFld"));
            createDocument = new CreateDocument(document.getElementById("createDocument"), document.getElementById("createDoc"));
        }

        this.refresh = function () {
            this.hideContent();
            folderList.show();
        }

        this.hideContent = function () {
            documentDetails.hide();
            createFolder.hide();
            createSubFolder.hide();
            createDocument.hide();
        }
    }
}