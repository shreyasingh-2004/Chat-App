import { useEffect, useState } from "react";
import { Camera, Trash2, User, X, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { apiFetch } from "../../utils/api";

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ProfileModal = ({ isOpen, onClose }) => {
  const { authUser, setAuthUser } = useAuthContext();
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", bio: "" });

  useEffect(() => {
    if (isOpen) {
      setFullName(authUser?.fullName || "");
      setBio(authUser?.bio || "");
      setProfilePic(authUser?.profilePic || "");
      setErrors({ fullName: "", bio: "" });
    }
  }, [authUser, isOpen]);

  if (!isOpen) return null;

  const handlePickImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setProfilePic(dataUrl);
    } catch {
      toast.error("Could not read image file");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = { fullName: "", bio: "" };
    let ok = true;
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"; ok = false;
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters"; ok = false;
    } else if (fullName.trim().length > 60) {
      newErrors.fullName = "Name must be 60 characters or less"; ok = false;
    }
    if (bio.length > 160) {
      newErrors.bio = "Bio must be 160 characters or less"; ok = false;
    }
    setErrors(newErrors);
    return ok;
  };

  const handleSave = async () => {
    setErrors({ fullName: "", bio: "" });
    if (!validateForm()) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({ fullName, bio, profilePic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setAuthUser(data);
      localStorage.setItem("chat-user", JSON.stringify(data));
      toast.success("Profile updated!");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/60
        bg-white dark:bg-gray-900 shadow-2xl animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/50 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile settings</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage how you appear in chats.</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Avatar picker */}
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200/80 dark:border-gray-700/50
            bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl
              bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile photo</p>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">A clear square image works best.</p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl
                  bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-2 text-xs font-semibold text-white
                  hover:from-indigo-600 hover:to-cyan-600 transition-all shadow-md shadow-indigo-500/20">
                  <Camera className="h-4 w-4" />
                  {uploading ? "Reading…" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePickImage(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setProfilePic("")}
                  disabled={!profilePic || uploading}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700
                    px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300
                    hover:border-red-300 hover:text-red-600 hover:bg-red-50
                    dark:hover:border-red-800 dark:hover:text-red-400 dark:hover:bg-red-900/20
                    disabled:opacity-40 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <div className="relative">
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: "" }));
                }}
                className={`input-modern pr-10 ${errors.fullName ? "error" : ""}`}
                placeholder="John Doe"
              />
              {fullName.trim().length >= 2 && !errors.fullName && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {errors.fullName && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400" />
              )}
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3 h-3" />{errors.fullName}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">About</label>
            <textarea
              value={bio}
              maxLength={160}
              onChange={(e) => {
                setBio(e.target.value);
                if (errors.bio) setErrors((p) => ({ ...p, bio: "" }));
              }}
              rows={3}
              className={`w-full resize-none rounded-xl border-2 px-4 py-3 text-sm outline-none transition-all
                text-gray-900 dark:text-gray-100
                ${errors.bio
                  ? "border-red-400 bg-red-50 dark:bg-red-950/20 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                  : "border-gray-200 bg-white/80 dark:border-gray-700 dark:bg-gray-800/80 focus:border-indigo-400 focus:bg-white dark:focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                }`}
              placeholder="A short status or bio…"
            />
            <div className="flex items-center justify-between">
              {errors.bio
                ? <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bio}</p>
                : <span />
              }
              <span className={`text-[11px] ${bio.length > 150 ? "text-orange-400" : "text-gray-400"}`}>
                {bio.length}/160
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200/80 dark:border-gray-700/50 px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn-primary"
          >
            {saving
              ? <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving…</>
              : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;