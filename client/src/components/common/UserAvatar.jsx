import { useState } from "react";
import { User } from "lucide-react";
import { safeAvatarSrc } from "../../utils/displayUser";

const UserAvatar = ({ src, name = "", size = 40, className = "" }) => {
  const [broken, setBroken] = useState(false);
  const resolved = safeAvatarSrc(src);
  const showImg = Boolean(resolved) && !broken;
  const dim = { width: size, height: size };
  const iconPx = Math.max(14, Math.round(size * 0.45));

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full
        bg-gradient-to-br from-indigo-500 to-cyan-500 text-white ${className}`}
      style={dim}
      title={name || "User"}
    >
      {showImg ? (
        <img
          src={resolved}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <User style={{ width: iconPx, height: iconPx }} className="text-white" />
      )}
    </div>
  );
};

export default UserAvatar;