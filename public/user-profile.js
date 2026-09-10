const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const params = new URLSearchParams(window.location.search);
const username = params.get("username");

const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileAvatar = document.getElementById("profileAvatar");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const followButton = document.getElementById("followButton");
const profileMessage = document.getElementById("profileMessage");

let profileId;

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

async function loadUserProfile() {
    try {
        const response = await fetch(`/api/users/${username}`);
        const user = await response.json();

        if (!response.ok) {
            profileName.textContent = "User not found";
            return;
        }

        profileId = user.id;

        profileAvatar.textContent = user.name.charAt(0).toUpperCase();
        profileName.textContent = user.name;
        profileUsername.textContent = `@${user.username}`;
        profileBio.textContent = user.bio || "No bio added yet.";
        followersCount.textContent = user.followers;
        followingCount.textContent = user.following;
    } catch (error) {
        profileName.textContent = "Unable to load profile";
    }
}

followButton.addEventListener("click", async () => {
    if (!profileId) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${profileId}/follow`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok) {
            followButton.textContent = result.following ? "Following" : "Follow";
            followButton.classList.toggle("following", result.following);
            followersCount.textContent = result.followers;
            profileMessage.textContent = result.message;
        } else {
            profileMessage.textContent = result.message;
        }
    } catch (error) {
        profileMessage.textContent = "Unable to update follow status";
    }
});

loadUserProfile();