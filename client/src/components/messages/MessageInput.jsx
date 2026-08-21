import { useRef, useState } from "react";
import { File, FileText, Image, Music, Paperclip, Send, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import useSendMessage from "../../hooks/useSendMessage";
import useSendGroupMessage from "../../hooks/useSendGroupMessage";
import { getApiBaseUrl } from "../../utils/api";

const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB, matches server limit

const getMediaType = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "voice";
  return "file";
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i > 0 && n < 10 ? 1 : 0)} ${units[i]}`;
};

const fileIconFor = (mediaType) => {
  if (mediaType === "image") return Image;
  if (mediaType === "video") return Video;
  if (mediaType === "voice") return Music;
  return FileText;
};

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  // pending = local preview state shown while a file is selected/uploading
  const [pending, setPending] = useState(null); // { name, size, mediaType, previewUrl }
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const xhrRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket } = useSocketContext();
  const { isGroupChat, selectedConversation, replyTo, clearReplyTo } =
    useConversation();
  const { sendMessage, loading: personalLoading } = useSendMessage();
  const { sendGroupMessage, loading: groupLoading } = useSendGroupMessage();

  const loading = personalLoading || groupLoading || uploading;

  const resetAttachmentState = () => {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setAttachment(null);
    setUploadProgress(0);
  };

  const uploadFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max size is ${formatBytes(MAX_FILE_SIZE)}`);
      return;
    }

    const mediaType = getMediaType(file);
    // Local preview appears instantly, like WhatsApp, before the upload even starts
    const previewUrl =
      mediaType === "image" || mediaType === "video"
        ? URL.createObjectURL(file)
        : null;

    setPending({ name: file.name, size: file.size, mediaType, previewUrl });
    setAttachment(null);
    setUploading(true);
    setUploadProgress(0);

    (async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaType", mediaType);

        const data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;
          xhr.open("POST", `${baseUrl}/api/messages/upload-media`);

          if (token && token !== "undefined" && token !== "null") {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

          xhr.onload = () => {
            let parsed;
            try {
              parsed = JSON.parse(xhr.responseText);
            } catch {
              return reject(new Error("Upload failed"));
            }
            if (xhr.status >= 200 && xhr.status < 300) resolve(parsed);
            else reject(new Error(parsed.error || "Upload failed"));
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.onabort = () => reject(new Error("cancelled"));

          xhr.send(formData);
        });

        setAttachment({
          url: data.url,
          fileName: data.fileName,
          type: data.type,
          size: data.size,
          mimeType: data.mimeType,
          thumbnailUrl: data.thumbnailUrl,
          duration: data.duration,
        });
      } catch (error) {
        if (error.message !== "cancelled") {
          toast.error(error.message || "Upload failed");
          resetAttachmentState();
        }
      } finally {
        setUploading(false);
        xhrRef.current = null;
      }
    })();
  };

  const cancelUpload = () => {
    xhrRef.current?.abort();
    resetAttachmentState();
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
      resetAttachmentState();
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
  const PendingIcon = pending ? fileIconFor(pending.mediaType) : File;

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

      {(replyTo || pending) && (
        <div
          className="mb-2.5 flex flex-col gap-2 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50
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

          {pending && (
            <div className="flex items-center gap-3">
              {/* Thumbnail with a circular progress ring while uploading, WhatsApp-style */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                {pending.mediaType === "image" && pending.previewUrl && (
                  <img
                    src={pending.previewUrl}
                    alt={pending.name}
                    className="h-full w-full object-cover"
                  />
                )}
                {pending.mediaType === "video" && pending.previewUrl && (
                  <video
                    src={pending.previewUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                )}
                {pending.mediaType !== "image" && pending.mediaType !== "video" && (
                  <div className="flex h-full w-full items-center justify-center text-indigo-500">
                    <PendingIcon className="h-5 w-5" />
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeDasharray={`${uploadProgress}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-700 dark:text-gray-200">
                  {pending.name}
                </div>
                <div className="text-gray-400">
                  {uploading
                    ? `Uploading… ${uploadProgress}%`
                    : formatBytes(pending.size)}
                </div>
              </div>

              <button
                type="button"
                onClick={uploading ? cancelUpload : resetAttachmentState}
                className="rounded-md p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={uploading ? "Cancel upload" : "Remove"}
              >
                <X className="h-4 w-4" />
              </button>
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
          disabled={personalLoading || groupLoading}
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
          {personalLoading || groupLoading ? (
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
