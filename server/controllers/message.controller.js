import Conversation from "../models/conversation.modal.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: [],
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message,
        });

        conversation.messages.push(newMessage._id);
        await conversation.save();
        await newMessage.save();

        res.status(200).json({ message: "New Message sent successfully" });

    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).send({ error: "Internal server error" });
    }
};
