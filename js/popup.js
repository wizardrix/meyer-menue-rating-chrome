import { createDeleteButton } from "./element-factory.js";

function createTableElement(content) {
    const td = document.createElement("td");
    td.innerText = content;
    return td;
}

function loadMemoryCapacityIntoElement(data) {
    const memoryCapacityElement = document.getElementById(
        "mmr-memory-capacity"
    );
    memoryCapacityElement.innerHTML = Object.keys(data).length + "/512";
}

chrome.storage.sync.get(null, (data) => {
    loadMemoryCapacityIntoElement(data);

    const tableBody = document.getElementById("mmr-table-body");
    for (const key in data) {
        console.log(data[key]);
        console.log(data[key].name);
        const row = document.createElement("tr");

        row.appendChild(createTableElement(key));
        row.appendChild(createTableElement(data[key].name));
        row.appendChild(createTableElement(data[key].rating + "/5"));
        const deleteTd = createTableElement("");
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add("mmr-flex-v-align");
        btnWrapper.appendChild(
            createDeleteButton(() => {
                chrome.storage.sync.remove(key);
                row.remove();
                chrome.storage.sync.get(null, (data) => {
                    loadMemoryCapacityIntoElement(data);
                });
            })
        );
        deleteTd.appendChild(btnWrapper);
        row.appendChild(deleteTd);

        tableBody.appendChild(row);
    }
});
