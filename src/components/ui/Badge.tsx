import { getStatusColor, classNames } from "@/lib/utils";

interface BadgeProps {
  status: string;
}

export function StatusBadge({ status }: BadgeProps) {
  const colors = getStatusColor(status);

  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors.bg,
        colors.text
      )}
    >
      <span className={classNames("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {status}
    </span>
  );
}
