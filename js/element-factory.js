function createDeleteButton(deleteListener) {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("mmr-delete-btn");
    const deleteIcon = document.createElement("span");
    deleteIcon.classList.add("material-icons-outlined");
    deleteIcon.innerHTML = "delete";
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener("click", deleteListener);
    return deleteButton;
}

export { createDeleteButton };
