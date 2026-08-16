// ======================================================
// TASK MANAGER FRONTEND
// ======================================================


// ======================================================
// BACKEND API
// ======================================================

const API = "https://day-19-task-manager-backend.onrender.com";


// ======================================================
// LOGIN
// ======================================================

async function login() {

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");

    if (!emailInput || !passwordInput) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;


    if (!email || !password) {

        alert("Please enter your email and password.");

        return;
    }


    try {

        const response = await axios.post(
            `${API}/login`,
            {
                email: email,
                password: password
            }
        );


        console.log("Login response:", response.data);


        const token = response.data.token;
        const user = response.data.user;


        if (!token) {

            alert("Login failed. Token was not received.");

            return;
        }


        // Save JWT token

        localStorage.setItem(
            "token",
            token
        );


        // Save logged-in user

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        alert("Login successful!");


        // Go to task dashboard

        window.location.href = "tasks.html";


    } catch (error) {

        console.error("Login error:", error);


        const message =
            error.response?.data?.message ||
            "Login failed. Please check your email and password.";


        alert(message);

    }

}


// ======================================================
// CREATE ACCOUNT
// ======================================================

async function createAccount() {

    const nameInput = document.getElementById("signupName");
    const emailInput = document.getElementById("signupEmail");
    const passwordInput = document.getElementById("signupPassword");


    if (!nameInput || !emailInput || !passwordInput) {
        return;
    }


    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;


    if (!name || !email || !password) {

        alert("Please fill in all fields.");

        return;
    }


    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");

        return;
    }


    try {

        const response = await axios.post(
            `${API}/users`,
            {
                name: name,
                email: email,
                password: password
            }
        );


        console.log(
            "Create account response:",
            response.data
        );


        alert(
            response.data.message ||
            "Account created successfully!"
        );


        // Clear signup fields

        nameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";


        // Put email into login box

        document.getElementById(
            "loginEmail"
        ).value = email;


        document.getElementById(
            "loginPassword"
        ).focus();


    } catch (error) {

        console.error(
            "Create account error:",
            error
        );


        const message =
            error.response?.data?.message ||
            "Could not create account.";


        alert(message);

    }

}


// ======================================================
// GET STORED TOKEN
// ======================================================

function getToken() {

    return localStorage.getItem("token");

}


// ======================================================
// GET STORED USER
// ======================================================

function getUser() {

    const user = localStorage.getItem("user");


    if (!user) {
        return null;
    }


    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        return null;

    }

}


// ======================================================
// LOAD TASKS
// ======================================================

async function loadTasks() {

    const taskList = document.getElementById("taskList");


    // If we are on login page,
    // there is no task list.

    if (!taskList) {
        return;
    }


    const token = getToken();
    const user = getUser();


    // User isn't logged in

    if (!token || !user) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    try {

        const response = await axios.get(
            `${API}/tasks?userId=${user.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );


        const tasks = response.data;


        taskList.innerHTML = "";


        if (!tasks || tasks.length === 0) {

            taskList.innerHTML =
                "<p>No tasks yet. Add your first task!</p>";

            return;
        }


        tasks.forEach(task => {

            const div =
                document.createElement("div");


            div.className = "task";


            const title =
                escapeHTML(task.title);


            const category =
                escapeHTML(
                    task.category || "Personal"
                );


            div.innerHTML = `

                <div class="task-info">

                    <div
                        class="task-title ${
                            task.completed
                                ? "completed"
                                : ""
                        }"
                    >
                        ${title}
                    </div>

                    <span class="category">
                        ${category}
                    </span>

                </div>


                <div class="buttons">

                    <button
                        class="complete-btn"
                        onclick="
                            toggleTask(
                                '${task._id}',
                                ${!task.completed}
                            )
                        "
                    >
                        ${
                            task.completed
                                ? "Undo"
                                : "Complete"
                        }
                    </button>


                    <button
                        class="edit-btn"
                        onclick="
                            editTask(
                                '${task._id}'
                            )
                        "
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="
                            deleteTask(
                                '${task._id}'
                            )
                        "
                    >
                        Delete
                    </button>

                </div>

            `;


            taskList.appendChild(div);

        });


    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );


        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");


            alert(
                "Your login session has expired. Please login again."
            );


            window.location.href =
                "index.html";


            return;
        }


        alert("Could not load tasks.");

    }

}


// ======================================================
// ADD TASK
// ======================================================

async function addTask() {

    const input =
        document.getElementById("taskInput");


    const category =
        document.getElementById("categorySelect");


    if (!input || !category) {
        return;
    }


    const title =
        input.value.trim();


    const selectedCategory =
        category.value;


    const token =
        getToken();


    const user =
        getUser();


    if (!token || !user) {

        alert("Please login first.");

        window.location.href =
            "index.html";

        return;
    }


    if (!title) {

        alert("Please enter a task.");

        return;
    }


    try {

        await axios.post(
            `${API}/tasks`,
            {
                title: title,
                category: selectedCategory,
                userId: user.id
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        input.value = "";

        category.value =
            "Personal";


        await loadTasks();


    } catch (error) {

        console.error(
            "Error adding task:",
            error
        );


        alert(
            error.response?.data?.message ||
            "Could not add task."
        );

    }

}


// ======================================================
// COMPLETE / UNDO TASK
// ======================================================

async function toggleTask(
    id,
    completed
) {

    const token =
        getToken();


    if (!token) {

        alert("Please login again.");

        window.location.href =
            "index.html";

        return;
    }


    try {

        await axios.put(
            `${API}/tasks/${id}`,
            {
                completed: completed
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Error updating task:",
            error
        );


        alert(
            error.response?.data?.message ||
            "Could not update task."
        );

    }

}


// ======================================================
// EDIT TASK
// ======================================================

async function editTask(id) {

    const token =
        getToken();


    if (!token) {

        alert("Please login again.");

        window.location.href =
            "index.html";

        return;
    }


    const newTitle =
        prompt(
            "Enter the new task title:"
        );


    if (newTitle === null) {
        return;
    }


    const trimmedTitle =
        newTitle.trim();


    if (!trimmedTitle) {

        alert(
            "Task title cannot be empty."
        );

        return;
    }


    try {

        await axios.put(
            `${API}/tasks/${id}`,
            {
                title: trimmedTitle
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Error editing task:",
            error
        );


        alert(
            error.response?.data?.message ||
            "Could not edit task."
        );

    }

}


// ======================================================
// DELETE TASK
// ======================================================

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    const token =
        getToken();


    if (!token) {

        alert("Please login again.");

        window.location.href =
            "index.html";

        return;
    }


    try {

        await axios.delete(
            `${API}/tasks/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );


        await loadTasks();


    } catch (error) {

        console.error(
            "Error deleting task:",
            error
        );


        alert(
            error.response?.data?.message ||
            "Could not delete task."
        );

    }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    window.location.href =
        "index.html";

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const taskList =
            document.getElementById(
                "taskList"
            );


        // Only run dashboard code
        // when tasks.html is open.

        if (taskList) {

            const user =
                getUser();


            const token =
                getToken();


            if (!user || !token) {

                window.location.href =
                    "index.html";

                return;
            }


            const welcome =
                document.getElementById(
                    "welcomeMessage"
                );


            if (welcome) {

                welcome.textContent =
                    `Welcome, ${
                        user.name || "User"
                    }!`;

            }


            loadTasks();

        }

    }
);