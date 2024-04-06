import Conversation from "../models/conversation.modal.js";
import Message from "../models/message.model.js";

//send message
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

        if(newMessage){
            conversation.messages.push(newMessage._id);

        }

        //Socket.io functionality will be added here

        
        //await conversation.save();
        //await newMessage.save();
        // Instead of saving the conversation and message separately, we can save them together using Promise.all
        await Promise.all([conversation.save(), newMessage.save()]);

        res.status(200).json({ message: "New Message sent successfully" });

    } catch (error) {
        console.error("Error in sendMessage controller: ", error.message);
        res.status(500).send({ error: "Internal server error" });
    }
};

//get messages
export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};