function initSidebarObserver() {
    console.log("init sidebar observer");
    const sidebar = document.getElementById("sidebar");
    const sidebarObserver = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.target.nodeName === "DETAILS-VIEW") {
                detailsContainer = mutation.addedNodes.item(0);
                loadRatingIntoDetailsView(detailsContainer);
            }
        }
    });
    sidebarObserver.observe(sidebar, {
        subtree: true,
        childList: true
    });
}

// The menus are loaded into the calendar after the side finished loading,
// therefore we need to listen on the calendar element once
// The switching of the week is observed by the mainObserver
function initCalendarObserver() {
    console.log("init calendar observer");
    const calendar = document.getElementById("calendar");
    if (!calendar) {
        console.log("no calendar found");
        return;
    }

    const calendarObserver = new MutationObserver((mutationList, observer) => {
        loadRatingsIntoCalendar();
    });
    calendarObserver.observe(calendar, {
        subtree: true,
        characterData: true
    });
}

function getMenuElement(menuId) {
    return document.querySelector("[data-image$=\"" + menuId + "\"]");
}

function loadRatingsIntoCalendar() {
    console.log("load ratings");
    document.querySelectorAll("[data-image]").forEach(element => {
        loadRatingIntoMenuElement(element);
    });
}

function loadRatingIntoMenuElement(menuElement) {
    const menuId = menuElement.getAttribute("data-image").split("/").at(-1);
    const headlineElement = menuElement.nextSibling.firstChild.childNodes[1];
    loadRatingIntoElement(headlineElement, menuId);
}

async function loadRatingIntoElement(element, menuId) {
    // clear element (in case rating was deleted)
    element.childNodes.forEach(child => {
        if (child.classList.contains("rating-display")) {
            child.remove();
        }
    });
    const menu = await loadRatingById(menuId);
    // append rating element
    if (typeof menu[menuId] !== "undefined") {
        let ratingElement = document.createElement("div");
        ratingElement.classList.add("rating-display");
        fillStarRatingElement(ratingElement, menu[menuId].rating);
        element.appendChild(ratingElement);
    }
}

function fillStarRatingElement(ratingElement, rating) {
    ratingElement.textContent = "";
    for (let i = 1; i <= 5; i++) {
        const starElement = document.createElement("span");
        starElement.classList.add("star-icon");
        if (rating >= i) {
            starElement.classList.add("filled");
            starElement.innerHTML = "&starf;";
        } else {
            starElement.innerHTML = "&star;";
        }
        ratingElement.appendChild(starElement);
    }
}

async function loadRatingIntoDetailsView(detailsContainer) {
    const menuId = document.getElementsByClassName("detail-image")[0].children[0].src.split("/").at(-1);
    const menuName = document.getElementsByClassName("detail-headline")[0].children[0].innerText;
    console.log(menuId + ": " + menuName);

    const menu = await loadRatingById(menuId);
    const rating = typeof menu[menuId] === "undefined" ? -1 : menu[menuId].rating;

    const ratingContainer = document.createElement("div");
    ratingContainer.classList.add("rating-container");
    const ratingElement = createRatingElement(rating, async (val) => {
        await saveRating(menuId, menuName, val);
        loadRatingIntoMenuElement(getMenuElement(menuId))
    });
    const deleteButton = createDeleteButton(async () => {
        await deleteRating(menuId);
        ratingContainer.remove();
        loadRatingIntoDetailsView(detailsContainer);
        loadRatingIntoMenuElement(getMenuElement(menuId));
    });
    ratingContainer.appendChild(ratingElement);
    ratingContainer.appendChild(deleteButton);

    detailsContainer.childNodes.forEach((child) => {
        if (typeof child.classList !== "undefined" && child.classList.contains("sidebar-frame")) {
            detailsContainer.insertBefore(ratingContainer, child);
        }
    });

}

function createRatingElement(curValue, saveListener) {
    console.log(curValue);
    const ratingElement = document.createElement("div");
    ratingElement.classList.add("rating-input");
    for (let val = 1; val <= 5; val++) {
        const radioStar = createRadioStar(val, val == curValue);
        ratingElement.appendChild(createRadioStar(val, val == curValue, saveListener));
    }
    return ratingElement;
}

function createRadioStar(value, checked, changeListener) {
    const radio = document.createElement("input");
    radio.setAttribute("type", "radio");
    radio.setAttribute("name", "rating");
    radio.setAttribute("value", value);
    radio.checked = checked;
    radio.addEventListener("change", () => changeListener(value));
    return radio;
}

function createDeleteButton(deleteListener) {
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "&#128465;";
    deleteButton.addEventListener("click", deleteListener);
    return deleteButton;
}

function loadRatingById(menuId) {
    return chrome.storage.sync.get(menuId);
}

function saveRating(menuId, name, rating) {
    return chrome.storage.sync.set({
        [menuId]: {
            name: name,
            rating: rating
        }
    })
}

function deleteRating(menuId) {
    return chrome.storage.sync.remove(menuId);
}

chrome.storage.sync.get(null, menus => console.log(menus));
chrome.storage.sync.getBytesInUse(null, bytes => console.log(bytes));

// to load the ratings into the calendar, when the week is switched,
// we need to listen for child addition to the main element
const main = document.getElementById("main");
const mainObserver = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.addedNodes.length > 0) {
            initSidebarObserver();
            if (document.querySelectorAll("[data-image]").length > 0) {
                loadRatingsIntoCalendar();
            } else {
                initCalendarObserver();
            }
        }
    }
});
mainObserver.observe(main, {
    childList: true
});

initSidebarObserver();
initCalendarObserver();
