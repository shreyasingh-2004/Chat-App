import { useRef, useState } from "react";
import { File, Image, Paperclip, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import useSendMessage from "../../hooks/useSendMessage";
import useSendGroupMessage from "../../hooks/useSendGroupMessage";
import { apiFetch } from "../../utils/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getMediaType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
};

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket } = useSocketContext();
  const { isGroupChat, selectedConversation, replyTo, clearReplyTo } =
    useConversation();
  const { sendMessage, loading: personalLoading } = useSendMessage();
  const { sendGroupMessage, loading: groupLoading } = useSendGroupMessage();

  const loading = personalLoading || groupLoading || uploading;

  const uploadFile = async (file) => {
    setUploading(true);

    try {
      const dataUrl = await fileToDataUrl(file);
      const mediaType = getMediaType(file);

      const res = await apiFetch("/api/messages/upload-media", {
        method: "POST",
        body: JSON.stringify({
          dataUrl,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          mediaType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setAttachment({
        url: data.url,
        fileName: data.fileName,
        type: data.type,
        size: data.size,
        mimeType: data.mimeType,
      });
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadFile(file);
    event.target.value = "";
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    if (!socket || !selectedConversation) return;

    const payload = isGroupChat
      ? { groupId: selectedConversation._id }
      : { receiverId: selectedConversation._id };

    socket.emit("typing", payload);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", payload);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!message.trim() && !attachment?.url) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!selectedConversation) {
      toast.error("No conversation selected");
      return;
    }

    if (!socket) {
      toast.error("Not connected to server");
      return;
    }

    if (uploading) {
      toast.error("Please wait, file is uploading…");
      return;
    }

    const options = {
      attachment: attachment || undefined,
      replyTo: replyTo?._id || null,
    };

    try {
      if (isGroupChat) {
        await sendGroupMessage(
          message.trim(),
          selectedConversation._id,
          options
        );
      } else {
        await sendMessage(
          message.trim(),
          selectedConversation._id,
          options
        );
      }

      setMessage("");
      setAttachment(null);
      clearReplyTo();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (socket && selectedConversation) {
        socket.emit(
          "stopTyping",
          isGroupChat
            ? { groupId: selectedConversation._id }
            : { receiverId: selectedConversation._id }
        );
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  const canSend = (message.trim() || attachment?.url) && !loading;

  return (
    <div
      className="border-t border-gray-200/80 dark:border-gray-700/50
      bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-3"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.zip,.csv,.mp4,.mov,.mkv,.avi,.webm,.mp3,.wav"
        className="hidden"
        tabIndex="-1"
        onChange={handleFileChange}
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex="-1"
        onChange={handleFileChange}
      />

      {(replyTo || attachment || uploading) && (
        <div
          className="mb-2.5 flex flex-col gap-1.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50
          bg-indigo-50/80 dark:bg-indigo-900/20 px-3 py-2 text-xs"
        >
          {replyTo && (
            <PreviewRow
              label="Reply"
              value={
                replyTo.message ||
                replyTo.attachment?.fileName ||
                "Attachment"
              }
              onClear={clearReplyTo}
            />
          )}

          {attachment && (
            <PreviewRow
              label={
                attachment.type === "image"
                  ? "Image"
                  : attachment.type === "video"
                  ? "Video"
                  : "File"
              }
              value={attachment.fileName}
              onClear={() => setAttachment(null)}
            />
          )}

          {uploading && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <div className="h-3 w-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <span>Uploading…</span>
            </div>
          )}
        </div>
      )}

      <div
        className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 dark:border-gray-700
        bg-gray-50 dark:bg-gray-900 px-3 py-1.5
        focus-within:border-indigo-400 dark:focus-within:border-indigo-600
        focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]
        transition-all duration-200"
      >
        <button
          type="button"
          tabIndex="-1"
          onClick={() => fileInputRef.current?.click()}
          className="composer-tool"
          title="Attach file or video"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <button
          type="button"
          tabIndex="-1"
          onClick={() => imageInputRef.current?.click()}
          className="composer-tool"
          title="Attach image"
        >
          <Image className="h-4 w-4" />
        </button>

        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isGroupChat ? "Message this group…" : "Type a message…"
          }
          className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 dark:text-gray-100
            outline-none placeholder:text-gray-400"
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          title="Send"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
            bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/25
            hover:from-indigo-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-indigo-500/30
            hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {loading ? (
            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value, onClear }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex min-w-0 items-center gap-2 text-indigo-700 dark:text-indigo-300">
      <File className="h-3.5 w-3.5 flex-shrink-0" />

      <span className="font-semibold uppercase tracking-wide text-[10px]">
        {label}
      </span>

      <span className="truncate text-gray-600 dark:text-gray-400">
        {value}
      </span>
    </div>

    <button
      type="button"
      onClick={onClear}
      className="rounded-md p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default MessageInput;