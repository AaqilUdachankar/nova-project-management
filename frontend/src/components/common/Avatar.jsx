import { getInitials, colorFromString } from "../../utils/helpers";

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

const Avatar = ({ name = "?", size = "sm", ring = false }) => {
  const bg = colorFromString(name);
  return (
    <div
      className={`${sizeMap[size]} rounded-full flex items-center justify-center font-semibold text-white shrink-0 ${
        ring ? "ring-2 ring-white" : ""
      }`}
      style={{ backgroundColor: bg }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
