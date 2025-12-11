var express = require("express");
var router = express.Router();

router.post("/comment/:commentId/like", checkToken, async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) return res.json({ result: false, error: "Comment not found" });

    if (comment.likes.includes(userId)) {
        return res.json({ result: false, error: "Already liked" });
    }

    comment.likes.push(userId);
    await comment.save();

    res.json({ result: true, likes: comment.likes.length });
});

router.post("/comments/:commentId/unlike", checkToken, async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.json({ result: false, error: "Comment nout found" })

    comment.likes = comment.likes.filter(id => id.toString() !== userId);
    await comment.save();

    res.json({ result: true, likes: comment.likes.length });
})

router.post("/comments/:commentId/reply", checkToken, async (req, res) => {
    try {
        const { content } = req.body;
        const parentCommentId = req.params.commentId;

        if (!content || content.trim() === "") {
            return res.json({ result: false, error: "Empty reply" });
        }

        const parent = await Comment.findById(parentCommentId);
        if (!parent) {
            return res.json({ result: false, error: "Parent comment not found" });
        }

        const reply = await Comment.create({
            api: parent.api,
            author: req.user.id,
            content,
            parentComment: parentCommentId
        });

        parent.replies.push(reply._id);
        await parent.save();

        return res.json({ result: true, reply });
    } catch (error) {
        console.error("Error creating comment", error);
        res.status(500).json({ result: false, error: error.message });
    }
})