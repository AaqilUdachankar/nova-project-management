import Avatar from "./Avatar";

const AvatarStack = ({ users = [], size = "xs", max = 3 }) => {
  const shown = users.slice(0, max);
  const remaining = users.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((u) => (
        <Avatar key={u._id || u.id || u.name} name={u.name} size={size} ring />
      ))}
      {remaining > 0 && (
        <div className="w-6 h-6 rounded-full bg-ink-100 text-ink-500 text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default AvatarStack;
