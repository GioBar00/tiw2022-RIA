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
            document.getElementById("userName").textContent = escapeHtml(JSON.parse(sessionStorage.getItem("user")).username);
            document.getElementById("Logout").addEventListener("click", function () {
                document.getElementById("Logout").disable = true;
                logout();
            });
            pageOrchestrator.start();
            pageOrchestrator.refresh();
        }
    }, false);

    /**
     * This method logs out the user and goes to the login page.
     */
    function logout() {
        makeCall("GET", 'logout', function (response) {
            if (response.readyState === XMLHttpRequest.DONE) {
                switch (response.status) {
                    case 200:
                        sessionStorage.clear();
                        window.location.href = "login.html";
                        break;
                    default :
                        alert("Unknown Error");
                        break;
                }
            }
        });
    }

    /**
     * This class handles the list of folders and documents.
     * @param container The container where the list will be displayed.
     */
    function FolderList(container) {
        this.containter = container;

        /**
         * This method calls the server to get the list of folders and documents.
         * If the call is successful, the list is displayed by calling {@link this.showContent} method.
         */
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
                            logout();
                            break;
                        case 500:
                            alert(text);
                            break;
                    }
                }
            });
        };

        /**
         * This method changes the value of the EditButton and then show the edit buttons fo adding new content.
         */
        this.edit = function () {
            const self = this;
            let editButton = document.getElementById("EditButton");
            editButton.textContent = "UNDO";
            editButton.onclick = function () {
                self.undo();
                pageOrchestrator.hideContent();
            };
            let showDetails = document.getElementsByClassName("ShowDetails");
            for (const btnDetail of showDetails) {
                btnDetail.style.visibility = "hidden";
            }

            let editButtons = document.getElementsByClassName("mngBtn");
            for (const editBtn of editButtons) {
                editBtn.style.visibility = "visible";
            }
        }

        /**
         * This method hides the edit buttons and sets the value of the EditButton to "EDIT".
         */
        this.undo = function () {
            pageOrchestrator.hideContent();
            const self = this;
            let editButton = document.getElementById("EditButton");
            editButton.textContent = "EDIT";
            editButton.onclick = function () {
                self.edit();
            };

            let showDetails = document.getElementsByClassName("ShowDetails");
            for (const btnDetail of showDetails) {
                btnDetail.style.visibility = "visible";
            }

            let editButtons = document.getElementsByClassName("mngBtn");
            for (const editBtn of editButtons) {
                editBtn.style.visibility = "hidden";
            }
        }

        /**
         * This method builds the list of folder and sets up the content.
         * @param view the list of folders, sub folders and documents.
         */
        this.showContent = function (view) {
            this.containter.innerHTML = "";
            const self = this;
            //get edit button and set up onclick event.
            let editButton = document.getElementById("EditButton");
            editButton.textContent = "EDIT";
            editButton.onclick = function () {
                self.edit();
            };
            //create new folder button.
            let button = document.createElement("button");
            button.className = "mngBtn";
            button.textContent = "Create Folder";
            button.addEventListener("click", function (e) {
                createFolder.enableForm();
            });
            this.containter.appendChild(button);

            //Building the list of folders.
            view.forEach((folderWithSub) => {
                //Create the li element that contains the folder.
                let folderElement = document.createElement("li");
                folderElement.classList.add("folder");
                folderElement.textContent = folderWithSub.folder.name;
                folderElement.setAttribute("folderId", folderWithSub.folder.id);

                //create new subfolder button.
                let button = document.createElement("button");
                button.className = "mngBtn";
                button.textContent = "Create SubFolder";
                button.addEventListener("click", function (e) {
                    createSubFolder.enableForm(folderWithSub.folder.id);
                });
                folderElement.appendChild(button);

                //for each subfolder.
                if (folderWithSub.subFolderAndDocumentsList != null && folderWithSub.subFolderAndDocumentsList.length > 0) {
                    //create a new ul element that contains the subfolders.
                    let subFolders = document.createElement("ul");
                    folderWithSub.subFolderAndDocumentsList.forEach((subFolderAndDocuments) => {
                        //create the li element that contains the subfolder.
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
                            createDocument.enableForm(subFolderAndDocuments.subFolder.id);
                        })

                        subFolders.appendChild(subFolderElement);

                        //for each document.
                        if (subFolderAndDocuments.documentList != null && subFolderAndDocuments.documentList.length > 0) {
                            //create a new ul element that contains the documents.
                            let documents = document.createElement("ul");
                            subFolderAndDocuments.documentList.forEach((doc) => {
                                //create the li element that contains the document.
                                let documentElement = document.createElement("li");
                                documentElement.classList.add("document");
                                documentElement.textContent = doc.name + "." + doc.format;
                                let showDetails = document.createElement("button");
                                showDetails.className = "ShowDetails";
                                showDetails.textContent = "Show Details";
                                documentElement.setAttribute("documentId", doc.id);
                                documentElement.setAttribute("subfolderId", doc.subFolderId);
                                //show details on click
                                showDetails.addEventListener("click", function (e) {
                                    documentDetails.showDocument(doc.id);
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

            //add the trashcan folder
            let trashCan = document.createElement("li");
            trashCan.textContent = "TrashCan";
            trashCan.id = "trashCan";
            this.containter.appendChild(trashCan);

            //set the edit button to edit mode
            this.undo();

            //set up the drag and drop
            dragAndDropManager.setupDragAndDrop();
        }
    }

    /**
     * This class handles the drag and drop functionalities.
     */
    function DragAndDropManager() {
        let notDroppable;
        let startElement;

        /**
         * This method sets up the drag and drop functionality.
         */
        this.setupDragAndDrop = function () {
            let elements = document.getElementsByClassName("document");

            //setting up the draggable elements and assigning them the dragstart event.
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

            //setting up the droppable elements and assigning them the dragover, dragleave and drop events.
            this.setDocumentDrop();
            this.setTrashCan();
        }

        /**
         * This method sets up the dragstart for a movable element (usually a document).
         * @param element the element we want to assign the dragstart event to.
         */
        this.setMove = function (element) {
            let self = this;
            element.addEventListener("dragstart", function (e) {
                self.startElement = e.target.closest("li");
                self.findNotDroppable(self.startElement);
                self.notDroppable.style.backgroundColor = "red";
            });
        }

        /**
         * This method sets up the dragstart for a deletable element (usually a folder or subfolder).
         * @param element the element we want to assign the dragstart event to.
         */
        this.setDelete = function (element) {
            let self = this;
            element.addEventListener("dragstart", function (e) {
                self.startElement = e.target;
            });
        }

        /**
         * This method sets up the dragover, dragleave and drop events for the trash can element.
         * When an element is dragged over the trash can it can be deleted.
         */
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
                    //request to delete the element.
                    //For the request we have to find the proper servlet.
                    //If the request is successful the folder list has to be refreshed.
                    if (self.startElement.classList.contains("document")) {
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
                    } else {
                        if (self.startElement.classList.contains("subfolder")) {
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
                        } else {
                            if (self.startElement.classList.contains("folder")) {
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

        /**
         * Finds the element that can't be a drop target cause is the subfolder of the startElement.
         * @param startElement the document element who has been dragged.
         */
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

        /**
         * This method sets the dragover, dragleave and drop for each droppable element.
         * The droppable elements are the subfolders.
         */
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
                    if (subFolderId !== self.startElement.getAttribute("subfolderId")) {
                        let formData = new FormData();
                        formData.append("subFolderId", subFolderId);
                        formData.append("documentId", self.startElement.getAttribute("documentId"));
                        //send the move request to the server. If it's successful the folder list is refreshed.
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

        /**
         * Reset the droppable elements and the notDroppable element.
         */
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


    /**
     * This class is used to show the document details.
     * @param options a list of container elements.
     */
    function ShowDocument(options) {
        this.container = options['container'];
        this.documentName = options['documentName'];
        this.documentDate = options['documentDate'];
        this.documentFormat = options['documentFormat'];
        this.documentSummary = options['documentSummary'];
        this.button = options['button'];

        /**
         * Hides the document details.
         */
        this.hide = function () {
            this.container.style.visibility = "hidden";
        };

        /**
         * Shows the document details by calling setDocumentDetail method.
         * @param documentID the id of the document to show.
         */
        this.showDocument = function (documentID) {
            let self = this;
            //make a request to the server to get the document details.
            makeCall("GET", "document?documentId=" + documentID, function (response) {
                if (response.readyState === XMLHttpRequest.DONE) {
                    let text = response.responseText;
                    switch (response.status) {
                        case 200:
                            self.setDocumentDetails(JSON.parse(text));
                            break;
                        case 403:
                            alert(text);
                            break;
                        case 500:
                            alert(text);
                            break;
                        default:
                            alert("Unknown error");
                            break;
                    }
                }
            });

        }

        /**
         * Sets up the container with the document details.
         * @param doc the document to show.
         */
        this.setDocumentDetails = function (doc) {
            pageOrchestrator.hideContent();
            this.container.style.visibility = "visible";
            this.documentName.textContent = doc.name;
            this.documentFormat.textContent = doc.format;
            this.documentSummary.textContent = doc.summary;
            this.documentDate.textContent = doc.date;

            this.button.addEventListener("click", function (e) {
                e.target.closest("div").style.visibility = "hidden";
            });
        }
    }

    /**
     * This class is used for creating a new Folder
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateFolder(container, button) {
        this.container = container;
        this.button = button;

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
        }

        /**
         * This method sets the create folder form visible and the event on the submit button.
         */
        this.enableForm = function () {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");
                if (form.checkValidity()) {
                    //make a request to the server to create the folder.
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
                        , form);
                } else form.reportValidity();
            }, false);
        }
    }

    /**
     * This class is used for creating a new sub-folder.
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateSubFolder(container, button) {
        this.container = container;
        this.button = button;

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
        }

        /**
         * This method sets the create subfolder form visible and the event on the submit button.
         */
        this.enableForm = function (folderId) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");

                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("folderId", folderId);
                    //make a request to the server to create the sub-folder.
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

    /**
     * This class is used for creating a new document.
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateDocument(container, button) {
        this.container = container;
        this.button = button;

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
        }

        /**
         * This method sets the create document form visible and the event on the submit button.
         */
        this.enableForm = function (subfolderId) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";

            button.addEventListener("click", function (e) {
                const form = e.target.closest("form");
                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("subfolderId", subfolderId);
                    //make a request to the server to create the document.
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

    /**
     * This class is used for setting up the page and passing the right elements to the classes.
     */
    function PageOrchestrator() {
        /**
         * This method is called on refresh. Crates the classes by passing them the right elements.
         */
        this.start = function () {
            folderList = new FolderList(document.getElementById("folderList"));
            documentDetails = new ShowDocument({
                container: document.getElementById("documentDetails"),
                documentName: document.getElementById("documentName"),
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

        /**
         * This method refreshes the page.
         */
        this.refresh = function () {
            this.hideContent();
            folderList.show();
        }

        /**
         * This method hides all the content except the folder list.
         */
        this.hideContent = function () {
            documentDetails.hide();
            createFolder.hide();
            createSubFolder.hide();
            createDocument.hide();
        }
    }
}