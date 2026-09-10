const token = localStorage.getItem("token");
const usersContainer = document.getElementById("usersContainer");

if (!token) {
    window.location.href = "index.html";
}

const postsContainer = document.getElementById("postsContainer");
const postForm = document.getElementById("postForm");
const postMessage = document.getElementById("postMessage");

document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = document.getElementById("postContent").value.trim();

    if (!content) {
        return;
    }

    try {
        const response = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        const result = await response.json();
        postMessage.textContent = result.message;

        if (response.ok) {
            postForm.reset();
            loadPosts();
        }
    } catch (error) {
        postMessage.textContent = "Unable to create post";
    }
});

async function loadPosts() {
    try {
        const response = await fetch("/api/posts");
        const posts = await response.json();

        if (!response.ok) {
            postsContainer.innerHTML = "<p>Unable to load posts.</p>";
            return;
        }

        if (posts.length === 0) {
            postsContainer.innerHTML = "<p>No posts yet. Create the first post!</p>";
            return;
        }

        postsContainer.innerHTML = posts.map((post) => `
            <article class="post-card">
                <div class="post-header">
                    <div>
                        <p class="post-author">${post.user.name}</p>
                        <p class="post-username">@${post.user.username}</p>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                <div class="post-actions">
                    <button class="like-button" data-id="${post._id}">
                        Like (${post.likes.length})
                    </button>
                    <button class="comment-button" data-id="${post._id}">
                        Comment (${post.comments.length})
                    </button>
                    <button class="delete-button" data-id="${post._id}">
                        Delete
                    </button>
                </div>
                <div class="comments-section hidden" id="comments-${post._id}">
                    <div class="comments-list">
                        ${post.comments.map((comment) => `
                            <div class="comment">
                                <strong>${comment.user.name}</strong>
                                <span>@${comment.user.username}</span>
                                <p>${comment.content}</p>
                            </div>
                        `).join("")}
                    </div>
                    <form class="comment-form" data-id="${post._id}">
                        <input type="text" placeholder="Write a comment..." required>
                        <button type="submit">Comment</button>
                    </form>
                    <p class="comment-message" id="comment-message-${post._id}"></p>
                </div>
            </article>
        `).join("");

        document.querySelectorAll(".like-button").forEach((button) => {
            button.addEventListener("click", () => likePost(button.dataset.id));
        });

        document.querySelectorAll(".comment-button").forEach((button) => {
            button.addEventListener("click", () => {
                document.getElementById(`comments-${button.dataset.id}`).classList.toggle("hidden");
            });
        });

        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", () => deletePost(button.dataset.id));
        });

        document.querySelectorAll(".comment-form").forEach((form) => {
            form.addEventListener("submit", (event) => addComment(event, form.dataset.id));
        });
    } catch (error) {
        postsContainer.innerHTML = "<p>Unable to connect to the server.</p>";
    }
}

async function likePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}/like`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadPosts();
        }
    } catch (error) {
        console.error("Like error:", error);
    }
}

async function addComment(event, postId) {
    event.preventDefault();

    const form = event.target;
    const input = form.querySelector("input");
    const message = document.getElementById(`comment-message-${postId}`);

    const content = input.value.trim();

    if (!content) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        const result = await response.json();
        message.textContent = result.message;

        if (response.ok) {
            form.reset();
            loadPosts();
        }
    } catch (error) {
        message.textContent = "Unable to add comment";
    }
}

async function deletePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadPosts();
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

loadPosts();

async function loadUsers() {
    try {
        const response = await fetch("/api/users", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const users = await response.json();

        if (!response.ok) {
            usersContainer.innerHTML = "<p>Unable to load users.</p>";
            return;
        }

        if (users.length === 0) {
            usersContainer.innerHTML = "<p>No other users yet.</p>";
            return;
        }

        usersContainer.innerHTML = users.map((user) => `
            <div class="user-card">
                <a href="user-profile.html?username=${user.username}" class="user-profile-link">
                    <div class="user-avatar">
                        ${user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-details">
                        <strong>${user.name}</strong>
                        <span>@${user.username}</span>
                        <p>${user.bio || "No bio added yet."}</p>
                        <small>${user.followers} followers</small>
                    </div>
                </a>
                <button class="follow-button ${user.following ? "following" : ""}" data-id="${user.id}">
                    ${user.following ? "Following" : "Follow"}
                </button>
            </div>
            </div>
        `).join("");

        document.querySelectorAll(".follow-button").forEach((button) => {
            button.addEventListener("click", () => followUser(button.dataset.id));
        });
    } catch (error) {
        usersContainer.innerHTML = "<p>Unable to connect to the server.</p>";
    }
}

async function followUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/follow`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadUsers();
        }
    } catch (error) {
        console.error("Follow error:", error);
    }
}

loadUsers();