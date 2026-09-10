const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const user = JSON.parse(localStorage.getItem("user"));

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

async function loadProfile() {
    try {
        const response = await fetch("/api/users/profile/me", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const profile = await response.json();

        if (!response.ok) {
            return;
        }

        document.getElementById("profileAvatar").textContent = profile.name.charAt(0).toUpperCase();
        document.getElementById("profileName").textContent = profile.name;
        document.getElementById("profileUsername").textContent = `@${profile.username}`;
        document.getElementById("profileBio").textContent = profile.bio || "No bio added yet.";
        document.getElementById("followersCount").textContent = profile.followers;
        document.getElementById("followingCount").textContent = profile.following;
    } catch (error) {
        console.error("Profile error:", error);
    }
}

loadProfile();