// ==========================================
// API URL
// ==========================================

const API = "https://day-19-task-manager-backend.onrender.com/tasks";

// Current logged-in user
const USER_ID = "6a7da44958d3f261a42e88d1";


// ==========================================
// LOAD ALL TASKS
// ==========================================

async function loadTasks() {
    try {
        const response = await axios.get(`${API}?userId=${USER_ID}`);
        const tasks = response.data;

        const list = document.getElementById("taskList");

        list.innerHTML = "";

        if (tasks.length === 0) {
            list.innerHTML = "<p>No tasks yet. Add your first task!</p>";
            return;
        }

        tasks.forEach(task => {

            const div = document.createElement("div");
            div.className = "task";

            div.innerHTML = `
                <div class="task-info">

                    <div class="task-title ${task.completed ? "completed" : ""}">
                        ${task.title}
                    </div>

                    <span class="category">
                        ${task.category || "Personal"}
                    </span>

                </div>

                <div class="buttons">

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

                </div>
            `;

            list.appendChild(div);
        });

    } catch (error) {
        console.error("Error loading tasks:", error);
        alert("Could not load tasks.");
    }
}


// ==========================================
// ADD TASK
// ==========================================

async function addTask() {

    const input = document.getElementById("taskInput");
    const category = document.getElementById("categorySelect");

    const title = input.value.trim();
    const selectedCategory = category.value;

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    try {

        await axios.post(API, {
            title: title,
            category: selectedCategory,
            userId: USER_ID
        });

        input.value = "";

        category.value = "Personal";

        await loadTasks();

    } catch (error) {

        console.error("Error adding task:", error);

        alert("Could not add task.");
    }
}


// ==========================================
// COMPLETE / UNDO TASK
// ==========================================

async function toggleTask(id, completed) {

    try {

        await axios.put(`${API}/${id}`, {
            completed: completed
        });

        await loadTasks();

    } catch (error) {

        console.error("Error updating task:", error);

        alert("Could not update task.");
    }
}


// ==========================================
// EDIT TASK
// ==========================================

async function editTask(id, oldTitle) {

    const newTitle = prompt("Edit your task:", oldTitle);

    if (newTitle === null) {
        return;
    }

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
        alert("Task cannot be empty.");
        return;
    }

    try {

        await axios.put(`${API}/${id}`, {
            title: trimmedTitle
        });

        await loadTasks();

    } catch (error) {

        console.error("Error editing task:", error);

        alert("Could not edit task.");
    }
}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        await axios.delete(`${API}/${id}`);

        await loadTasks();

    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Could not delete task.");
    }
}


// ==========================================
// ESCAPE QUOTES FOR EDIT BUTTON
// ==========================================

function escapeQuotes(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
}


// ==========================================
// LOAD TASKS WHEN PAGE OPENS
// ==========================================

loadTasks();