{
    let folderList, documentDetails, createFolder, createSubFolder, createDocument, dragAndDropManager,
        pageOrchestrator = new PageOrchestrator();
    /**
     * This method checks if the user is logged in.
     */
    window.addEventListener('load', function () {
        if (sessionStorage.getItem("user") == null) {
            window.location.href = "login.html";
        } else {
            document.getElementById("userName").textContent = JSON.parse(sessionStorage.getItem("user")).username;
            document.getElementById("Logout").addEventListener("click", function () {
                sessionStorage.clear();
                window.location.href = "login.html";
            });
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    }, false);

    function FolderList(container) {
        this.containter = container;

        this.show = function () {
            this.containter.innerHTML = "";
            const self = this;
            makeCall("GET", "GetFolders", function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    const text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.showContent(JSON.parse(text));
                            break;
                        case 403:
                            sessionStorage.clear();
                            window.location.href = "login.html";
                            break;
                        case 500:
                            alert(text);
                            break;
                    }
                }
            });
        };

        this.edit = function () {
            const self = this;
            let editButton = document.getElementById("EditButton");
            editButton.value = "UNDO";
            editButton.onclick = function () {
                self.undo();
                pageOrchestrator.hideContent();
            };
            let showDetails = document.getElementsByClassName("ShowDetails");

            for (let i = 0; i < showDetails.length; i++) {
                showDetails[i].style.visibility = "hidden";
            }

            let editButtons = document.getElementsByClassName("mngBtn");
            for (let i = 0; i < editButtons.length; i++) {
                editButtons[i].style.visibility = "visible";
            }

        }

        this.undo = function () {
            pageOrchestrator.hideContent();
            const self = this;
            let editButton = document.getElementById("EditButton");
            editButton.value = "EDIT";
            editButton.onclick = function () {
                self.edit();
            };

            let showDetails = document.getElementsByClassName("ShowDetails");
            for (let i = 0; i < showDetails.length; i++) {
                showDetails[i].style.visibility = "visible";
            }

            let editButtons = document.getElementsByClassName("mngBtn");
            for (let i = 0; i < editButtons.length; i++) {
                editButtons[i].style.visibility = "hidden";
            }

        }

        this.showContent = function (view) {
            this.containter.innerHTML = "";
            const self = this;
            let editButton = document.getElementById("EditButton");
            editButton.value = "EDIT";
            editButton.onclick = function () {
                self.edit();
            };
            //create new folder button
            let button = document.createElement("button");
            button.className = "mngBtn";
            button.textContent = "Create Folder";
            button.addEventListener("click", function (e) {
                createFolder.enableForm();
            });
            this.containter.appendChild(button);

            view.forEach((folderWithSub) => {
                let folderElement = document.createElement("li");
                folderElement.classList.add("folder");
                folderElement.textContent = folderWithSub.folder.name;
                folderElement.setAttribute("folderId", folderWithSub.folder.id);

                //create new subfolder button
                let button = document.createElement("button");
                button.className = "mngBtn";
                button.textContent = "Create SubFolder";
                button.addEventListener("click", function (e) {
                    createSubFolder.enableForm(e.target.closest("li").getAttribute("folderId"));
                });
                folderElement.appendChild(button);

                if (folderWithSub.subFolderAndDocumentsList != null && folderWithSub.subFolderAndDocumentsList.length > 0) {
                    let subFolders = document.createElement("ul");
                    folderWithSub.subFolderAndDocumentsList.forEach((subFolderAndDocuments) => {
                        let subFolderElement = document.createElement("li");
                        subFolderElement.classList.add("subfolder");
                        subFolderElement.textContent = subFolderAndDocuments.subFolder.name;
                        subFolderElement.setAttribute("subfolderId", subFolderAndDocuments.subFolder.id);
                        subFolderElement.classList.add("droppable");

                        // create new document button
                        let button = document.createElement("button");
                        button.className = "mngBtn";
                        button.textContent = "Create Document";
                        subFolderElement.appendChild(button);
                        button.addEventListener("click", function (e) {
                            createDocument.enableForm(e.target.closest("li").getAttribute("subfolderId"));
                        })

                        subFolders.appendChild(subFolderElement);

                        if (subFolderAndDocuments.documentList != null && subFolderAndDocuments.documentList.length > 0) {
                            let documents = document.createElement("ul");
                            subFolderAndDocuments.documentList.forEach((doc) => {
                                let documentElement = document.createElement("li");
                                documentElement.classList.add("document");
                                documentElement.textContent = doc.name;
                                let showDetails = document.createElement("a");
                                showDetails.className = "ShowDetails";
                                showDetails.textContent = "    Show Details";
                                documentElement.setAttribute("documentId", doc.id);
                                documentElement.setAttribute("subfolderId", doc.subFolderId);
                                //show details on click
                                showDetails.addEventListener("click", function (e) {
                                    documentDetails.showDocument(e.target.closest("li").getAttribute("documentId"));
                                });
                                documentElement.appendChild(showDetails);
                                documents.appendChild(documentElement);
                            });
                            subFolders.appendChild(documents);
                        }
                    });
                    folderElement.appendChild(subFolders);
                }
                self.containter.appendChild(folderElement);
            });
            let trashCan = document.createElement("li");
            trashCan.textContent = "TrashCan";
            trashCan.id = "trashCan";
            this.containter.appendChild(trashCan);
            this.undo();

            dragAndDropManager.setupDragAndDrop();
        }
    }

    function DragAndDropManager() {
        let notDroppable;
        let startElement;

        this.setupDragAndDrop = function () {
            let elements = document.getElementsByClassName("document");

            for (let element of elements) {
                this.setMove(element);
                element.setAttribute('draggable', "true");
            }
            elements = document.getElementsByClassName("subfolder");
            for (let element of elements) {
                this.setDelete(element);
                element.setAttribute('draggable', "true");
            }
            elements = document.getElementsByClassName("folder");
            for (let element of elements) {
                this.setDelete(element);
                element.setAttribute('draggable', "true");
            }

            this.setDocumentDrop();
            this.setTrashCan();
        }

        this.setMove = function (element) {
            let self = this;
            element.addEventListener("dragstart", function (e) {
                self.startElement = e.target.closest("li");
                self.findNotDroppable(self.startElement);
                self.notDroppable.style.backgroundColor = "red";
            });
        }

        this.setDelete = function (element) {
            let self = this;
            element.addEventListener("dragstart", function (e) {
                self.startElement = e.target;
            });
        }

        this.setTrashCan = function () {
            let trashCan = document.getElementById("trashCan");
            let self = this;
            trashCan.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    trashCan.classList.add("selected");
                }
            );

            trashCan.addEventListener("dragleave", function (e) {
                trashCan.classList.add("notSelected");
            });

            trashCan.addEventListener("drop", function (e) {
                trashCan.classList.add("notSelected");
                if (confirm("Are you sure you want to delete this item?")) {
                    if(self.startElement.classList.contains("document")){
                        makeCall("POST", 'delete-document?documentId=' + self.startElement.getAttribute("documentId"), function (response) {
                            if (response.readyState === XMLHttpRequest.DONE) {
                                let text = response.responseText;
                                switch (response.status) {
                                    case 200:
                                        folderList.show();
                                        break;
                                    case 400:
                                        alert(text);
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
                    else {
                        if(self.startElement.classList.contains("subfolder")){
                            makeCall("POST", 'delete-subfolder?subfolderId=' + self.startElement.getAttribute("subfolderId"), function (response) {
                                if (response.readyState === XMLHttpRequest.DONE) {
                                    let text = response.responseText;
                                    switch (response.status) {
                                        case 200:
                                            folderList.show();
                                            break;
                                        case 400:
                                            alert(text);
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
                        else {
                            if(self.startElement.classList.contains("folder")){
                                makeCall("POST", 'delete-folder?folderId=' + self.startElement.getAttribute("folderId"), function (response) {
                                    if (response.readyState === XMLHttpRequest.DONE) {
                                        let text = response.responseText;
                                        switch (response.status) {
                                            case 200:
                                                folderList.show();
                                                break;
                                            case 400:
                                                alert(text);
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
                        }
                    }
                }
                self.resetDroppable(self);
            });
        }


        this.findNotDroppable = function (startElement) {
            let elements = document.getElementsByClassName("droppable");
            let find = false;

            for (const element of elements) {
                if (element.getAttribute("subfolderId") === startElement.getAttribute("subfolderId")) {
                    this.notDroppable = element;
                    find = true;
                }
            }
        }
        this.setDocumentDrop = function () {
            let elements = document.getElementsByClassName("droppable");
            let self = this;

            for (const element of elements) {
                element.addEventListener("dragover", function (e) {
                        e.preventDefault();
                        element.classList.add("selected");
                    }
                );

                element.addEventListener("dragleave", function (e) {
                    element.classList.add("notSelected");
                });

                element.addEventListener("drop", function (e) {
                    self.resetDroppable(self);
                    let subFolderId = e.target.getAttribute("subfolderId");
                    if(subFolderId !== self.startElement.getAttribute("subfolderId")){
                        let formData = new FormData();
                        formData.append("subFolderId", subFolderId);
                        formData.append("documentId", self.startElement.getAttribute("documentId"));
                        sendFormData("POST", 'move-document', function (response) {
                            if (response.readyState === XMLHttpRequest.DONE) {
                                let text = response.responseText;
                                switch (response.status) {
                                    case 200:
                                        pageOrchestrator.refresh();
                                        break;
                                    case 400:
                                        alert(text);
                                        break;
                                    case 500:
                                        alert(text);
                                        break;
                                    default:
                                        alert("Unknown error");
                                }
                            }
                        }, formData);
                    }
                });
            }
        }

        this.resetDroppable = function (self) {
            self.notDroppable.style.backgroundColor = "white";

            let elements = document.getElementsByClassName("selected");
            for (const element of elements) {
                element.classList.remove("selected");
            }
            elements = document.getElementsByClassName("notSelected");
            for (const element of elements) {
                element.classList.remove("notSelected");
            }

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
            let self = this;
            makeCall("GET", "document?documentId=" + documentID, function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.setDocumentDetails(JSON.parse(text));
                            break;
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
            }, false);

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
            dragAndDropManager = new DragAndDropManager();
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