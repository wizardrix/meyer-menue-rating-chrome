import { createDeleteButton } from "./element-factory.js";

function createTableElement(className, content) {
    const td = document.createElement("td");
    td.classList.add(className);
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

        row.appendChild(createTableElement("mmr-col-s", key));
        row.appendChild(createTableElement("mmr-col-l", data[key].name));
        row.appendChild(
            createTableElement("mmr-col-s", data[key].rating + "/5")
        );
        const deleteTd = createTableElement("mmr-col-s", "");
        deleteTd.appendChild(
            createDeleteButton(() => {
                chrome.storage.sync.remove(key);
                row.remove();
                chrome.storage.sync.get(null, (data) => {
                    loadMemoryCapacityIntoElement(data);
                });
            })
        );
        row.appendChild(deleteTd);

        tableBody.appendChild(row);
    }
});
