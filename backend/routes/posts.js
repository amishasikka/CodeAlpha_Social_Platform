const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name username")
            .sort({ createdAt: -1 });

        const postsWithComments = await Promise.all(
            posts.map(async (post) => {
                const comments = await Comment.find({ post: post._id })
                    .populate("user", "name username")
                    .sort({ createdAt: 1 });

                return {
                    ...post.toObject(),
                    comments
                };
            })
        );

        res.json(postsWithComments);
    } catch (error) {
        console.error("Get posts error:", error);
        res.status(500).json({ message: "Unable to load posts" });
    }
});

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Post content is required" });
        }

        const post = await Post.create({
            user: req.userId,
            content: content.trim()
        });

        const populatedPost = await post.populate("user", "name username");

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });
    } catch (error) {
        console.error("Create post error:", error);
        res.status(500).json({ message: "Unable to create post" });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.userId) {
            return res.status(403).json({ message: "You can only delete your own posts" });
        }

        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        res.status(500).json({ message: "Unable to delete post" });
    }
});

router.post("/:id/like", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const alreadyLiked = post.likes.some(
            (userId) => userId.toString() === req.userId
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                (userId) => userId.toString() !== req.userId
            );
        } else {
            post.likes.push(req.userId);
        }

        await post.save();

        res.json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            likes: post.likes.length
        });
    } catch (error) {
        console.error("Like post error:", error);
        res.status(500).json({ message: "Unable to like post" });
    }
});

router.post("/:id/comments", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment is required" });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await Comment.create({
            post: post._id,
            user: req.userId,
            content: content.trim()
        });

        const populatedComment = await comment.populate("user", "name username");

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });
    } catch (error) {
        console.error("Create comment error:", error);
        res.status(500).json({ message: "Unable to add comment" });
    }
});

module.exports = router;