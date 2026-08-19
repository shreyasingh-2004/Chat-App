import { useState, useEffect, useRef } from "react";
import {
  Check, Copy, Download,
  Edit3, FileText, MoreHorizontal, Reply, Trash2, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import UserAvatar from "../common/UserAvatar";

const Message = ({ message, isGroupMessage = false }) => {
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();
  const { setReplyTo } = useConversation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message?.message || "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const messageId = message?._id;

  if (!message || !authUser) return null;

  const messageSenderId = message.senderId?._id || message.senderId;
  const fromMe = String(messageSenderId) === String(authUser._id);
  const senderName = message.senderId?.fullName || message.senderId?.username;
  const deleted = message.isDeleted;

  const emitWithAck = (event, payload) =>
    new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error("Socket not connected"));
        return;
      }
      socket.emit(event, payload, (response) => {
        if (response?.success) resolve(response);
        else reject(new Error(response?.error || "Action failed"));
      });
    });

  const handleCopy = async () => {
    if (message.message) {
      await navigator.clipboard.writeText(message.message);
      toast.success("Message copied");
      setMenuOpen(false);
      setActiveMenuId(null);
    }
  };

  const handleEdit = async () => {
    if (!draft.trim()) return;
    try {
      await emitWithAck("editMessage", { messageId: message._id, message: draft });
      setEditing(false);
      setMenuOpen(false);
      setActiveMenuId(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (mode) => {
    try {
      await emitWithAck("deleteMessage", { messageId: message._id, mode });
      setMenuOpen(false);
      setActiveMenuId(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setActiveMenuId(menuOpen ? null : messageId);
  };

  const renderAttachment = () => {
    const attachment = message.attachment;
    if (!attachment?.url || deleted) return null;

    if (attachment.type === "image") {
      return (
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block overflow-hidden rounded-xl border border-black/10 dark:border-white/10 hover:opacity-90 transition-opacity"
        >
          <img
            src={attachment.url}
            alt={attachment.fileName || "attachment"}
            className="max-h-72 w-full object-cover"
          />
        </a>
      );
    }

    if (attachment.type === "voice") {
      return (
        <div className="mt-2 rounded-xl border border-black/10 bg-white/60 p-2 dark:border-white/10 dark:bg-gray-950/30">
          <audio controls src={attachment.url} className="h-9 w-full" />
        </div>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex max-w-xs items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-3 text-sm hover:bg-white dark:border-white/10 dark:bg-gray-950/30 dark:hover:bg-gray-900 transition-colors"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
          <FileText className="h-4 w-4" />
        </div>
        <span className="min-w-0 flex-1 truncate">{attachment.fileName || "Download file"}</span>
        <Download className="h-4 w-4 flex-shrink-0 opacity-60" />
      </a>
    );
  };

  return (
    <div className={`group mb-3 flex items-end gap-2 px-4 ${fromMe ? "justify-end" : "justify-start"}`}>
      {!fromMe && isGroupMessage && (
        <UserAvatar
          src={message.senderId?.profilePic}
          name={senderName || "User"}
          size={30}
          className="mb-5 flex-shrink-0"
        />
      )}

      {fromMe && !deleted && (
        <ActionCluster
          align="right"
          open={menuOpen && activeMenuId === messageId}
          setOpen={setMenuOpen}
          toggleMenu={toggleMenu}
          canEdit={Boolean(message.message)}
          canCopy={Boolean(message.message)}
          onReply={() => {
            setReplyTo(message);
            setMenuOpen(false);
            setActiveMenuId(null);
          }}
          onCopy={handleCopy}
          onEdit={() => { setEditing(true); setMenuOpen(false); setActiveMenuId(null); }}
          onDeleteMe={() => handleDelete("me")}
          onDeleteEveryone={() => handleDelete("everyone")}
        />
      )}

      <div className={`max-w-[78%] sm:max-w-[68%] ${fromMe ? "order-2" : "order-1"}`}>
        {isGroupMessage && !fromMe && senderName && (
          <div className="mb-1 ml-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
            {senderName}
          </div>
        )}

        {message.replyTo && (
          <div className={`mb-1.5 rounded-xl border-l-2 px-3 py-2 text-xs ${
            fromMe
              ? "border-cyan-300/70 bg-white/10 text-white/80"
              : "border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
          }`}>
            <span className="line-clamp-2">
              {message.replyTo.message || message.replyTo.attachment?.fileName || "Attachment"}
            </span>
          </div>
        )}

        <div className={fromMe ? "bubble-sent" : "bubble-recv"}>
          {deleted ? (
            <p className="text-sm italic opacity-60">This message was deleted</p>
          ) : editing ? (
            <div className="flex min-w-56 items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-indigo-300 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleEdit}
                className="rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 p-1.5 text-white hover:opacity-90"
                title="Save edit"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg p-1.5 text-white/70 hover:text-white hover:bg-white/10"
                title="Cancel edit"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {message.message && (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>
              )}
              {renderAttachment()}
              {message.isEdited && (
                <span className="mt-1 block text-[10px] uppercase tracking-wide opacity-50">edited</span>
              )}
            </>
          )}
        </div>

        <div className={`mt-1 flex items-center gap-1 ${fromMe ? "justify-end" : "justify-start"}`}>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            {extractTime(message.createdAt)}
          </span>
        </div>
      </div>

      {!fromMe && !deleted && (
        <ActionCluster
          align="left"
          open={menuOpen && activeMenuId === messageId}
          setOpen={setMenuOpen}
          toggleMenu={toggleMenu}
          canEdit={false}
          canCopy={Boolean(message.message)}
          onReply={() => {
            setReplyTo(message);
            setMenuOpen(false);
            setActiveMenuId(null);
          }}
          onCopy={handleCopy}
          onDeleteMe={() => handleDelete("me")}
        />
      )}
    </div>
  );
};

const ActionCluster = ({ 
  align, open, setOpen, toggleMenu,
  canEdit, canCopy,
  onReply, onCopy, onEdit, onDeleteMe, onDeleteEveryone,
}) => {
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 176; // w-44 = 176px
      const menuHeight = 200;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = rect.top - menuHeight - 8;
      let left = align === "right" ? rect.right - menuWidth : rect.left;
      
      if (top < 10) {
        top = rect.bottom + 8;
      }
      
      if (left + menuWidth > viewportWidth - 10) {
        left = viewportWidth - menuWidth - 10;
      }
      if (left < 10) {
        left = 10;
      }
      
      setMenuPosition({ top, left });
    }
  }, [open, align]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, setOpen]);

  return (
    <div className={`relative order-1 mb-5 ${align === "right" ? "ml-1" : "mr-1"}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        className="rounded-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-900 p-1.5
          text-gray-500 dark:text-gray-400
          shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400
          transition-all duration-150 opacity-0 group-hover:opacity-100
          hover:scale-105 active:scale-95"
        title="Message actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div 
          ref={menuRef}
          className="fixed z-[100] w-44 overflow-hidden rounded-xl
            border border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-900 py-1 text-sm shadow-xl
            animate-scale-in"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <MenuItem icon={Reply} label="Reply" onClick={onReply} />
          {canCopy && <MenuItem icon={Copy} label="Copy text" onClick={onCopy} />}
          {canEdit && <MenuItem icon={Edit3} label="Edit" onClick={onEdit} />}
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <MenuItem icon={Trash2} label="Delete for me" onClick={onDeleteMe} danger />
          {onDeleteEveryone && (
            <MenuItem icon={X} label="Delete for everyone" onClick={onDeleteEveryone} danger />
          )}
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 px-3 py-2 text-left
      hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-100
      ${danger
        ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-gray-700 dark:text-gray-200"}`}
  >
    <Icon className="h-4 w-4 flex-shrink-0" />
    <span>{label}</span>
  </button>
);

export default Message;