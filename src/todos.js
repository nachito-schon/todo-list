import { domThings } from "./dom-things";
import { format, add } from "date-fns";
import { dataStorage } from "./data-storage";

let todos = [];
function updateTodosKeys() {
    todos.forEach((todo, index) => {
        todo.setKey(index);
        dataStorage.storeTodo(todo.data);
    });
}

function deleteTodosOfProject(projectKey) {
    todos.forEach(todo => {
        const thisTodoProjectKey = todo.getProjectKey();
        if(thisTodoProjectKey === projectKey) {
            todo.deleteTodo();
        }
    });
    todos.forEach(todo => {
        const thisTodoProjectKey = todo.getProjectKey();
        if(thisTodoProjectKey > projectKey) {
            todo.setProjectKey((thisTodoProjectKey - 1));
        }
    });
}

function todo(title, date, description, priority, projectKey) {
    let key = todos.length;
    let isDone = false;
    const data = { key, title, date, description, priority, isDone, projectKey };
    function getKey() {
        return key;
    }

    function setKey(newKey) {
        key = newKey;
        data.key = newKey;
    }

    const dom = domThings.todo(title, date, description, priority, projectKey);
    function load() {
        dom.load();
        dom.container.addEventListener('click', () => {
            if ((window.getSelection().type != 'Range') && (description !== '')) {
                dom.container.classList.toggle('collapsed');
            }
        });
        dom.doneBtn.addEventListener('click', toggleDone);
        dom.editBtn.addEventListener('click', editTodo);
        dom.deleteBtn.addEventListener('click', deleteTodo);
    }

    function toggleDone() {
        isDone = !isDone;
        data.isDone = isDone;
        dataStorage.storeTodo(data);
        dom.container.dataset.done = isDone;
    }

    function getIsDone() {
        return isDone;
    }

    function editTodo() {
        dom.container.classList.add('hidden');
        dom.doneBtn.classList.add('hidden');
        dom.editBtn.classList.add('hidden');
        dom.deleteBtn.classList.add('hidden');
        const todoEdition = domThings.todoInput();
        todoEdition.load(dom.bigContainer);
        todoEdition.title.value = title;
        if(date !== ''){
            todoEdition.date.value = format(new Date(date), 'yyyy-MM-dd');
        }
        todoEdition.description.value = description;
        switch(priority) {
            case 'not-important':
                todoEdition.priority.notImportant.checked = true;
                break;
            case 'important':
                todoEdition.priority.important.checked = true;
                break;
            case 'very-important':
                todoEdition.priority.veryImportant.checked = true;
                break;
        }

        todoEdition.acceptBtn.addEventListener('click', () => {
            let newDate;
            if(todoEdition.date.value !== '') {
                newDate = format(add(new Date(todoEdition.date.value), {days: 1}), 'd / MMM / y (E)');
            }
            else {
                newDate = '';
            }
            setInfo(
                todoEdition.title.value,
                newDate,
                description = todoEdition.description.value,
                todoEdition.priority.getInput()
            );
            dataStorage.storeTodo(data);
            dom.setContent(
                title,
                date,
                description,
                priority
            );
            todoEdition.container.remove();
            dom.container.classList.remove('hidden');
            dom.doneBtn.classList.remove('hidden');
            dom.editBtn.classList.remove('hidden');
            dom.deleteBtn.classList.remove('hidden');
        });

        todoEdition.cancelBtn.addEventListener('click', () => {
            todoEdition.container.remove();
            dom.container.classList.remove('hidden');
            dom.doneBtn.classList.remove('hidden');
            dom.editBtn.classList.remove('hidden');
            dom.deleteBtn.classList.remove('hidden');
        });
    }
    
    function deleteTodo() {
        dom.bigContainer.remove();
        todos.forEach(todo => dataStorage.removeTodo(todo.getKey()));
        todos.splice(key, 1);
        updateTodosKeys();
    }

    function getProjectKey() {
        return projectKey;
    }

    function setProjectKey(newProjectKey) {
        projectKey = newProjectKey;
        data.projectKey = newProjectKey;
        dataStorage.storeTodo(data);
    }

    function setInfo(newTitle, newDate, newDescription, newPriority) {
        title = newTitle;
        date = newDate;
        description = newDescription;
        priority = newPriority;
        data.title = newTitle;
        data.date = newDate;
        data.description = newDescription;
        data.priority = newPriority;
    }

    return { getKey, setKey, load, toggleDone, getIsDone, deleteTodo, getProjectKey, setProjectKey, data };
}

function editNewTodo(todosContainer, addTodoButton, projectKey) {
    addTodoButton.classList.add('hidden');
    const todoEdition = domThings.todoInput();
    todoEdition.load(todosContainer);
    function endEditing() {
        todoEdition.container.remove();
        addTodoButton.classList.remove('hidden');
    }

    todoEdition.acceptBtn.addEventListener('click', () => {
        let dateInput;
        if(todoEdition.date.value !== '') {
            dateInput = format(add(new Date(todoEdition.date.value), {days: 1}), 'd / MMM / y (E)');
        }
        else {
            dateInput = '';
        }

        createTodo(
            todoEdition.title.value,
            dateInput,
            todoEdition.description.value,
            todoEdition.priority.getInput(),
            projectKey
        );
        endEditing();
    });

    todoEdition.cancelBtn.addEventListener('click', endEditing);
}

function createTodo(title, date, description, priority, projectKey, isDone) {
    todos.push(todo(title, date, description, priority, projectKey));
    const thisTodo = todos[(todos.length-1)];
    thisTodo.load();
    if(isDone) thisTodo.toggleDone();
    dataStorage.storeTodo(thisTodo.data);
}

export {
    todo,
    editNewTodo,
    createTodo,
    deleteTodosOfProject
};