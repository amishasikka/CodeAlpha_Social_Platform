const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/profile/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Unable to load profile" });
    }
});

router.get("/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            username: user.username,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length
        });
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Unable to load user" });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId }
        }).select("name username bio followers following");

        res.json(users.map((user) => ({
            id: user._id,
            name: user.name,
            username: user.username,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.includes(req.userId)
        })));
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Unable to load users" });
    }
});

router.post("/:id/follow", authMiddleware, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.userId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userToFollow._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const alreadyFollowing = currentUser.following.some(
            (userId) => userId.toString() === userToFollow._id.toString()
        );

        if (alreadyFollowing) {
            currentUser.following = currentUser.following.filter(
                (userId) => userId.toString() !== userToFollow._id.toString()
            );

            userToFollow.followers = userToFollow.followers.filter(
                (userId) => userId.toString() !== currentUser._id.toString()
            );
        } else {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.json({
            message: alreadyFollowing ? "Unfollowed successfully" : "Followed successfully",
            following: !alreadyFollowing,
            followers: userToFollow.followers.length
        });
    } catch (error) {
        console.error("Follow error:", error);
        res.status(500).json({ message: "Unable to follow user" });
    }
});

module.exports = router;