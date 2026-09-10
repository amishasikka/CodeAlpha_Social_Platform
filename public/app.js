const API_URL = "/api";

const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");

document.getElementById("showRegister").addEventListener("click", () => {
    loginCard.classList.add("hidden");
    registerCard.classList.remove("hidden");
});

document.getElementById("showLogin").addEventListener("click", () => {
    registerCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
});

document.getElementById("registerNav").addEventListener("click", () => {
    loginCard.classList.add("hidden");
    registerCard.classList.remove("hidden");
});

document.getElementById("loginNav").addEventListener("click", () => {
    registerCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
});

document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        name: document.getElementById("registerName").value,
        username: document.getElementById("registerUsername").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value
    };

    const message = document.getElementById("registerMessage");

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        message.textContent = result.message;

        if (response.ok) {
            document.getElementById("registerForm").reset();
            setTimeout(() => {
                registerCard.classList.add("hidden");
                loginCard.classList.remove("hidden");
            }, 800);
        }
    } catch (error) {
        message.textContent = "Unable to connect to the server";
    }
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    };

    const message = document.getElementById("loginMessage");

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        message.textContent = result.message;

        if (response.ok) {
            localStorage.setItem("token", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = "profile.html";
        }
    } catch (error) {
        message.textContent = "Unable to connect to the server";
    }
});