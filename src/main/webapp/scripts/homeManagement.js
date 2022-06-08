{
    /**
     * This method checks if the user is logged in.
     */
    if (sessionStorage.getItem("user") === null) {
        makeCall('GET', 'CheckLogin', function (response) {
            if (response.readyState === XMLHttpRequest.DONE) {
                const text = response.responseText;
                if (response.status === 200) {
                    sessionStorage.setItem("user", text);
                } else {
                    logout();
                }
            }
        });
    }

    let folderList, documentDetails, createFolder, createSubFolder, createDocument, dragAndDropManager,
        pageOrchestrator = new PageOrchestrator();
    /**
     * This starts the page if the user is logged in.
     */
    window.addEventListener('load', function () {
        pageOrchestrator.start();
        if (sessionStorage.getItem("user") === null) {
            logout()
        } else {
            start();
        }
    }, false);

    function start() {
        document.getElementById("userName").textContent = JSON.parse(sessionStorage.getItem("user")).username;
        document.getElementById("Logout").addEventListener("click", function () {
            document.getElementById("Logout").disable = true;
            logout();
        });
        pageOrchestrator.refresh();
    }

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
            button.style.float = "right";
            button.style.marginRight = "10px";
            button.style.marginTop = "20px";
            button.addEventListener("click", function () {
                createFolder.enableForm();
            });
            this.containter.appendChild(button);

            let title = document.createElement("h3");
            title.textContent = "Folders:";
            title.style.paddingLeft = "5px";
            this.containter.appendChild(title);

            let foldersUL = document.createElement("ul");

            //Building the list of folders.
            view.forEach((folderWithSub) => {
                //Create the li element that contains the folder.
                let folderLi = document.createElement("li");
                let folderDiv = document.createElement("div");
                folderDiv.classList.add("folder");
                folderDiv.textContent = folderWithSub.folder.name;
                folderDiv.setAttribute("folderId", folderWithSub.folder.id);
                //folderDiv.style.display = "inline";

                //create new subfolder button.
                let button = document.createElement("button");
                button.className = "mngBtn";
                button.textContent = "Create SubFolder";
                button.addEventListener("click", function () {
                    createSubFolder.enableForm(folderWithSub.folder.id, folderWithSub.folder.name);
                });
                folderLi.appendChild(folderDiv);
                folderLi.appendChild(button);

                //for each subfolder.
                if (folderWithSub.subFolderAndDocumentsList != null && folderWithSub.subFolderAndDocumentsList.length > 0) {
                    //create a new ul element that contains the subfolders.
                    let subFolderUL = document.createElement("ul");
                    folderWithSub.subFolderAndDocumentsList.forEach((subFolderAndDocuments) => {
                        //create the li element that contains the subfolder.
                        let subFolderLi = document.createElement("li");
                        let subFolderDiv = document.createElement("div");
                        subFolderDiv.classList.add("subfolder");
                        subFolderDiv.textContent = subFolderAndDocuments.subFolder.name;
                        subFolderDiv.setAttribute("subfolderId", subFolderAndDocuments.subFolder.id);
                        //subFolderDiv.style.display = "inline";
                        subFolderLi.appendChild(subFolderDiv);

                        // create new document button
                        let button = document.createElement("button");
                        button.className = "mngBtn";
                        button.textContent = "Create Document";
                        subFolderLi.appendChild(button);
                        button.addEventListener("click", function () {
                            createDocument.enableForm(subFolderAndDocuments.subFolder.id, subFolderAndDocuments.subFolder.name);
                        })

                        subFolderUL.appendChild(subFolderLi);

                        //for each document.
                        if (subFolderAndDocuments.documentList != null && subFolderAndDocuments.documentList.length > 0) {
                            //create a new ul element that contains the documents.
                            let documentUL = document.createElement("ul");
                            subFolderAndDocuments.documentList.forEach((doc) => {
                                //create the li element that contains the document.
                                let documentLi = document.createElement("li");
                                let documentDiv = document.createElement("div");
                                //docElement.style.display = "inline";
                                documentDiv.classList.add("document");
                                documentDiv.textContent = doc.name + "." + doc.format;
                                documentDiv.setAttribute("documentId", doc.id);
                                documentDiv.setAttribute("subfolderId", doc.subFolderId);
                                documentLi.appendChild(documentDiv);

                                let showDetails = document.createElement("button");
                                showDetails.className = "ShowDetails";
                                showDetails.textContent = "Show Details";
                                //show details on click
                                showDetails.addEventListener("click", function () {
                                    documentDetails.showDocument(doc.id);
                                });
                                documentLi.appendChild(showDetails);
                                documentUL.appendChild(documentLi);
                            });
                            subFolderUL.appendChild(documentUL);
                        }
                    });
                    folderLi.appendChild(subFolderUL);
                }
                foldersUL.appendChild(folderLi);
            });

            //add the trashcan folder
            let trashCanLi = document.createElement("li");
            let trashCanDiv = document.createElement("div");
            trashCanDiv.textContent = "TrashCan";
            trashCanDiv.id = "trashCan";
            trashCanLi.appendChild(trashCanDiv);
            foldersUL.appendChild(trashCanLi);

            self.containter.appendChild(foldersUL);

            //set the edit button to edit mode
            this.undo();

            //set up the drag and drop
            dragAndDropManager.setupDragAndDrop();
        }
    }

    function checkResponse(response) {
        if (response.readyState === XMLHttpRequest.DONE) {
            let text = response.responseText;
            switch (response.status) {
                case 200:
                    pageOrchestrator.refresh();
                    break;
                case 401:
                    alert("You are not logged in.")
                    logout();
                    break;
                case 400:
                case 500:
                    alert(text);
                    break;
                default:
                    alert("Unknown error");
            }
        }
    }

    /**
     * This class handles the drag and drop functionalities.
     */
    function DragAndDropManager() {
        let self = this;

        /**
         * This method sets up the drag and drop functionality.
         */
        this.setupDragAndDrop = function () {
            let elements = document.getElementsByClassName("document");

            //setting up the draggable elements and assigning them the dragstart event.
            for (let element of elements) {
                self.setMove(element);
                element.setAttribute('draggable', "true");
            }
            elements = document.getElementsByClassName("subfolder");
            for (let element of elements) {
                self.setDelete(element);
                element.setAttribute('draggable', "true");

            }
            elements = document.getElementsByClassName("folder");
            for (let element of elements) {
                self.setDelete(element);
                element.setAttribute('draggable', "true");
            }

            //setting up the droppable elements and assigning them the dragover, dragleave and drop events.
            self.setDocumentDrop();
            self.setTrashCan();
        }

        /**
         * This method sets up the dragstart for a movable element (usually a document).
         * @param element the element we want to assign the dragstart event to.
         */
        this.setMove = function (element) {
            element.addEventListener("dragstart", function (e) {
                e.target.classList.add("dragging");
                self.startElement = e.target;
                self.findNotDroppable(e.target);
                self.notDroppable.classList.add("not-droppable");
                let subFolders = document.getElementsByClassName("subfolder");
                for (let subFolder of subFolders) {
                    if (subFolder.getAttribute("subfolderId") !== self.notDroppable.getAttribute("subfolderId")) {
                        subFolder.classList.add("droppable");
                    }
                }
                let trashCan = document.getElementById("trashCan");
                trashCan.classList.add("droppable");
            });
            element.addEventListener("dragend", function (e) {
                e.target.classList.remove("dragging");
                self.resetDroppable();
            });
        }

        /**
         * This method sets up the dragstart for a deletable element (usually a folder or subfolder).
         * @param element the element we want to assign the dragstart event to.
         */
        this.setDelete = function (element) {
            element.addEventListener("dragstart", function (e) {
                e.target.classList.add("dragging");
                self.startElement = e.target;
                let trashCan = document.getElementById("trashCan");
                trashCan.classList.add("droppable");
            });
            element.addEventListener("dragend", function (e) {
                e.target.classList.remove("dragging");
                self.resetDroppable();
            });
        }

        /**
         * This method sets up the dragover, dragleave and drop events for the trash can element.
         * When an element is dragged over the trash can it can be deleted.
         */
        this.setTrashCan = function () {
            let trashCan = document.getElementById("trashCan");
            trashCan.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    trashCan.classList.add("dragover");
                }
            );

            trashCan.addEventListener("dragleave", function () {
                trashCan.classList.remove("dragover");
            });

            trashCan.addEventListener("drop", function () {
                if (confirm("Are you sure you want to delete this item?")) {
                    //request to delete the element.
                    //For the request we have to find the proper servlet.
                    //If the request is successful the folder list has to be refreshed.
                    if (self.startElement.classList.contains("document")) {
                        let formData = new FormData();
                        formData.append("documentId", self.startElement.getAttribute("documentId"));
                        sendFormData("POST", 'delete-document', function (response) {
                            checkResponse(response);
                        }, formData);
                    } else if (self.startElement.classList.contains("subfolder")) {
                        let formData = new FormData();
                        formData.append("subfolderId", self.startElement.getAttribute("subfolderId"));
                        sendFormData("POST", 'delete-subfolder', function (response) {
                            checkResponse(response);
                        }, formData);
                    } else if (self.startElement.classList.contains("folder")) {
                        let formData = new FormData();
                        formData.append("folderId", self.startElement.getAttribute("folderId"));
                        sendFormData("POST", 'delete-folder', function (response) {
                            checkResponse(response);
                        }, formData);
                    }
                }
                self.resetDroppable();
            });
        }

        /**
         * Finds the element that can't be a drop target cause is the subfolder of the startElement.
         * @param startElement the document element who has been dragged.
         */
        this.findNotDroppable = function (startElement) {
            let elements = document.getElementsByClassName("subfolder");
            let find = false;

            for (const element of elements) {
                if (element.getAttribute("subfolderId") === startElement.getAttribute("subfolderId")) {
                    self.notDroppable = element;
                    find = true;
                }
            }
        }

        /**
         * This method sets the dragover, dragleave and drop for each droppable element.
         * The droppable elements are the subfolders.
         */
        this.setDocumentDrop = function () {
            let elements = document.getElementsByClassName("subfolder");

            for (const element of elements) {
                element.addEventListener("dragover", function (e) {
                    if (element.classList.contains("droppable")) {
                        e.preventDefault();
                        element.classList.add("dragover");
                    }
                });

                element.addEventListener("dragleave", function () {
                    if (element.classList.contains("droppable")) {
                        element.classList.remove("dragover");
                    }
                });

                element.addEventListener("drop", function (e) {
                    let subFolderId = e.target.getAttribute("subfolderId");
                    if (subFolderId !== self.startElement.getAttribute("subfolderId")) {
                        let formData = new FormData();
                        formData.append("subFolderId", subFolderId);
                        formData.append("documentId", self.startElement.getAttribute("documentId"));
                        //send the move request to the server. If it's successful the folder list is refreshed.
                        sendFormData("POST", 'move-document', function (response) {
                            checkResponse(response);
                        }, formData);
                    }
                    self.resetDroppable();
                });
            }
        }

        /**
         * Reset the droppable elements and the notDroppable element.
         */
        this.resetDroppable = function () {
            for (const elem of document.getElementsByClassName("not-droppable")) {
                elem.classList.remove("not-droppable");
            }

            let elements = document.getElementsByClassName("droppable");
            for (const element of elements) {
                element.classList.remove("droppable");
            }

            self.notDroppable = null;
            self.startElement = null;
        }

    }


    /**
     * This class is used to show the document details.
     * @param options a list of container elements.
     */
    function ShowDocument(options) {
        const documentDetails = document.getElementById("documentDetails");
        documentDetails.parentNode.removeChild(documentDetails);

        /**
         * Hides the document details.
         */
        this.hide = function () {
            document.getElementById("rightContainer").style.visibility = "hidden";
            if (document.getElementById("rightContainer").contains(documentDetails))
                document.getElementById("rightContainer").removeChild(documentDetails);
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
                            document.getElementById("rightContainer").appendChild(documentDetails);
                            break;
                        case 401:
                            alert("You are not logged in.")
                            logout();
                            break;
                        case 400:
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
            document.getElementById("rightContainer").style.visibility = "visible";
            options['documentName'].textContent = doc.name;
            options['documentFormat'].textContent = doc.format;
            options['documentSummary'].textContent = doc.summary;
            options['documentDate'].textContent = doc.creationDate;

            options['button'].addEventListener("click", function () {
                document.getElementById("rightContainer").style.visibility = "hidden";
            });
        }
    }

    /**
     * This class is used for creating a new Folder
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateFolder(container, button) {
        const form = document.getElementById("createFolder");
        form.parentNode.removeChild(form);

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
            if (container.contains(form))
                container.removeChild(form);
        }

        /**
         * This method sets the create folder form visible and the event on the submit button.
         */
        this.enableForm = function () {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                if (form.checkValidity()) {
                    //make a request to the server to create the folder.
                    makeCall("POST", 'create-folder', function (response) {
                        checkResponse(response);
                    }, form, false);
                    form.reset();
                } else form.reportValidity();
            }, false);
            container.appendChild(form);
        }
    }

    /**
     * This class is used for creating a new sub-folder.
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateSubFolder(container, button) {
        this.button = button;
        const title = document.getElementById("createSubFolderTitle");
        const form = document.getElementById("createSubFolder");
        form.parentNode.removeChild(form);

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
            if (container.contains(form))
                container.removeChild(form);
        }

        /**
         * This method sets the create subfolder form visible and the event on the submit button.
         */
        this.enableForm = function (folderId, folderName) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("folderId", folderId);
                    //make a request to the server to create the sub-folder.
                    sendFormData("POST", 'create-subfolder', function (response) {
                        checkResponse(response);
                    }, formData);
                    form.reset();
                } else form.reportValidity();
            }, false);
            title.textContent = "Create subfolder inside folder " + folderName;
            container.appendChild(form);
        }

    }

    /**
     * This class is used for creating a new document.
     * @param container the container element.
     * @param button the button related to submit of the form.
     */
    function CreateDocument(container, button) {
        this.button = button;
        const title = document.getElementById("createDocumentTitle");
        const form = document.getElementById("createDocument");
        form.parentNode.removeChild(form);

        /**
         * Hides the container.
         */
        this.hide = function () {
            container.style.visibility = "hidden";
            if (container.contains(form))
                container.removeChild(form);
        }

        /**
         * This method sets the create document form visible and the event on the submit button.
         */
        this.enableForm = function (subfolderId, subfolderName) {
            pageOrchestrator.hideContent();
            container.style.visibility = "visible";
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                if (form.checkValidity()) {
                    const formData = new FormData(form);
                    formData.append("subfolderId", subfolderId);
                    //make a request to the server to create the document.
                    sendFormData("POST", 'create-document', function (response) {
                        checkResponse(response);
                    }, formData);
                    form.reset();
                } else form.reportValidity();
            }, false);
            title.textContent = "Create document inside subfolder " + subfolderName;
            container.appendChild(form);
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
            const rightContainer = document.getElementById("rightContainer");
            documentDetails = new ShowDocument({
                documentName: document.getElementById("documentName"),
                documentDate: document.getElementById("documentDate"),
                documentFormat: document.getElementById("documentFormat"),
                documentSummary: document.getElementById("documentSummary"),
                button: document.getElementById("hideDetails")
            });
            createFolder = new CreateFolder(rightContainer, document.getElementById("createFld"));
            createSubFolder = new CreateSubFolder(rightContainer, document.getElementById("createSubFld"));
            createDocument = new CreateDocument(rightContainer, document.getElementById("createDoc"));
            dragAndDropManager = new DragAndDropManager();
            this.hideContent();
        }

        /**
         * This method refreshes the page.
         */
        this.refresh = function () {
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