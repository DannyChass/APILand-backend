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