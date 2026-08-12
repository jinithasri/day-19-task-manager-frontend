// ========================================
// BACKEND API URL
// ========================================

const API = "https://day-19-task-manager-backend.onrender.com/tasks";


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(message, isError = false) {
    const messageElement = document.getElementById("message");

    messageElement.innerText = message;

    if (isError) {
        messageElement.style.color = "red";
    } else {
        messageElement.style.color = "green";
    }

    setTimeout(() => {
        messageElement.innerText = "";
    }, 3000);
}


// ========================================
// LOAD ALL TASKS
// ========================================

async function loadTasks() {
    try {

        const response = await axios.get(API);

        const tasks = response.data;

        const taskList = document.getElementById("taskList");

        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = "<p>No tasks yet. Add your first task! 🎯</p>";
            return;
        }

        tasks.forEach(task => {

            const li = document.createElement("li");

            li.className = "task";

            li.innerHTML = `
                <span class="task-title ${task.completed ? "completed" : ""}">
                    ${task.title}
                </span>

                <button
                    class="complete-btn"
                    onclick="toggleTask('${task._id}', ${!task.completed})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button
                    class="edit-btn"
                    onclick="editTask('${task._id}', '${escapeQuotes(task.title)}')">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask('${task._id}')">
                    Delete
                </button>
            `;

            taskList.appendChild(li);
        });

    } catch (error) {

        console.error("Load tasks error:", error);

        showMessage(
            "Could not connect to backend",
            true
        );
    }
}


// ========================================
// ADD TASK
// ========================================

async function addTask() {

    const input = document.getElementById("taskInput");

    const title = input.value.trim();

    if (!title) {
        showMessage("Please enter a task", true);
        return;
    }

    try {

        await axios.post(API, {
            title: title
        });

        input.value = "";

        showMessage("Task added successfully! ✅");

        loadTasks();

    } catch (error) {

        console.error("Add task error:", error);

        showMessage(
            "Failed to add task",
            true
        );
    }
}


// ========================================
// COMPLETE / UNDO TASK
// ========================================

async function toggleTask(id, completed) {

    try {

        await axios.put(`${API}/${id}`, {
            completed: completed
        });

        loadTasks();

    } catch (error) {

        console.error("Toggle task error:", error);

        showMessage(
            "Failed to update task",
            true
        );
    }
}


// ========================================
// EDIT TASK
// ========================================

async function editTask(id, oldTitle) {

    const newTitle = prompt(
        "Edit your task:",
        oldTitle
    );

    if (newTitle === null) {
        return;
    }

    const title = newTitle.trim();

    if (!title) {
        showMessage(
            "Task title cannot be empty",
            true
        );

        return;
    }

    try {

        await axios.put(`${API}/${id}`, {
            title: title
        });

        showMessage("Task updated successfully! ✏️");

        loadTasks();

    } catch (error) {

        console.error("Edit task error:", error);

        showMessage(
            "Failed to edit task",
            true
        );
    }
}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await axios.delete(`${API}/${id}`);

        showMessage("Task deleted successfully! 🗑️");

        loadTasks();

    } catch (error) {

        console.error("Delete task error:", error);

        showMessage(
            "Failed to delete task",
            true
        );
    }
}


// ========================================
// ESCAPE QUOTES FOR EDIT BUTTON
// ========================================

function escapeQuotes(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


// ========================================
// ENTER KEY SUPPORT
// ========================================

document
    .getElementById("taskInput")
    .addEventListener("keypress", function(event) {

        if (event.key === "Enter") {
            addTask();
        }

    });


// ========================================
// INITIAL LOAD
// ========================================

loadTasks();