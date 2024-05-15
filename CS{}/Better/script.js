const todoList = document.getElementById('todo-list');
const detailsContainer = document.getElementById('detailsContainer');
const detailsHeader = document.getElementById('detailsHeader');
const completedList = document.getElementById('completed-items');

function showPopup() {
    togglePopupDisplay('block', '');
}

function hidePopup() {
    togglePopupDisplay('none', '');
}

function togglePopupDisplay(display, inputValue) {
    const popup = document.getElementById('popup');
    popup.style.display = display;
    document.getElementById('taskInput').value = inputValue;
}

function createListItem(taskName) {
    const listItem = document.createElement('li');
    listItem.textContent = taskName;
    const optionsDropdown = createOptionsDropdown(listItem, deleteItem, markAsRead, true);
   
    listItem.appendChild(optionsDropdown);

    listItem.addEventListener('dblclick', () => renameItem(listItem));

    listItem.addEventListener('click', () => showDetails(taskName));

    return listItem;
}

function addItem() {
    const taskInput = document.getElementById('taskInput');
    const taskName = taskInput.value.trim();

    if (taskName !== '') {
        const listItem = createListItem(taskName);
        todoList.appendChild(listItem);
        taskInput.value = '';
        hidePopup();
    }
}

function createOptionsDropdown(item, deleteFunction, markAsReadFunction, isMainListItem) {
    const dropdown = document.createElement('select');

    const options = ['Options', 'Delete'];
    if (!isMainListItem) {
        options.push('Mark as Completed');
    }

    options.forEach((optionText, index) => {
        const option = document.createElement('option');
        option.value = index === 0 ? '' : optionText.toLowerCase().replace(' ', '');
        option.text = optionText;
        dropdown.add(option);
    });

    dropdown.onchange = function () {
        const selectedOption = dropdown.options[dropdown.selectedIndex].value;
        selectedOption === 'delete' ? deleteFunction(item) : markAsReadFunction(item);
        dropdown.selectedIndex = 0;
    };

    item.appendChild(dropdown);

    return dropdown;
}


function showDetails(item) {
    detailsHeader.textContent = item;
    detailsContainer.innerHTML = '';

    const subListItems = getSubListItems(item);

    const subList = document.createElement('ul');
    subList.id = 'subList';
    detailsContainer.appendChild(subList);

    subListItems.forEach(subItem => subList.appendChild(createSubListItem(subItem, deleteItem, markAsRead)));

    const addSubListButton = createAddSubListButton();
    detailsContainer.appendChild(addSubListButton);

    const header = document.createElement('h2');
    header.textContent = item;
    detailsContainer.insertBefore(header, detailsContainer.firstChild);
}

function getSubListItems(mainItem) {
    const subLists = JSON.parse(localStorage.getItem('subLists')) || {};
    return subLists[mainItem] || [];
}

function createSubListItem(subItem, deleteFunction, markAsReadFunction) {
    const subListItem = document.createElement('li');
    subListItem.textContent = subItem;
    const optionsDropdown = createOptionsDropdown(subListItem, deleteFunction, markAsReadFunction, false);

    subListItem.appendChild(optionsDropdown);
    subListItem.addEventListener('dblclick', () => renameItem(subListItem));
    return subListItem;
}

function createAddSubListButton() {
    const addSubListButton = document.createElement('button');
    addSubListButton.textContent = '+';
    addSubListButton.onclick = () => {
        const subItem = prompt('Enter a sub-item for ' + detailsHeader.textContent + ':');
        subItem && addSubList(subItem);
    };
    return addSubListButton;
}

function addSubList(subItem) {
    const subList = document.getElementById('subList');
    const subListItem = createSubListItem(subItem, deleteItem, markAsRead);
    subList.appendChild(subListItem);

    const mainList = detailsHeader.textContent;
    const subLists = JSON.parse(localStorage.getItem('subLists')) || {};
    subLists[mainList] = subLists[mainList] || [];
    subLists[mainList].push(subItem);
    localStorage.setItem('subLists', JSON.stringify(subLists));
}

function renameItem(item) {
    const newName = prompt('Enter new name', item.textContent);
    newName !== null && updateItem(item, newName);
}

function updateItem(item, newName) {
    detailsHeader.textContent = newName;
    item.textContent = newName;
    updateDropdown(item, newName);
    updateLocalStorage(item, newName);
}



function updateLocalStorage(item, newName) {
    if (item.parentElement.id === 'subList') {
        const subLists = JSON.parse(localStorage.getItem('subLists')) || {};
        const mainList = detailsHeader.textContent;
        const index = Array.from(item.parentElement.children).indexOf(item);
        subLists[mainList][index] = newName;
        localStorage.setItem('subLists', JSON.stringify(subLists));
    }
}

function deleteItem(item) {
    const mainList = detailsHeader.textContent;
    const subLists = JSON.parse(localStorage.getItem('subLists')) || {};

    if (item.parentElement.id !== 'subList') {
        delete subLists[mainList];
        localStorage.setItem('subLists', JSON.stringify(subLists));
        todoList.removeChild(item);
        clearDetailsContainer();
    } else {
        const index = Array.from(item.parentElement.children).indexOf(item);
        subLists[mainList] = subLists[mainList] || [];
        subLists[mainList].splice(index, 1);
        localStorage.setItem('subLists', JSON.stringify(subLists));
        item.parentElement.removeChild(item);
    }
}

function clearDetailsContainer() {
    detailsContainer.innerHTML = '';
    detailsHeader.textContent = '';
}

function markAsRead(item) {
    const mainItemName = detailsHeader.textContent;
    const completedSubItem = item.cloneNode(true); // Clone the sublist item

    // Remove the dropdown from the cloned sublist item
    const dropdown = completedSubItem.querySelector('select');
    dropdown.parentNode.removeChild(dropdown);

    // Update the text content of the completed sublist item to include the main item name
    completedSubItem.textContent = mainItemName + " --> " + completedSubItem.textContent;

    // Append the completed sublist item to the completed list
    completedList.appendChild(completedSubItem);

    // Remove the original sublist item from its parent
    item.parentNode.removeChild(item);

    // Additional logic if needed, e.g., updating local storage
}



function deleteItems() {
    console.log('Delete items');
}

