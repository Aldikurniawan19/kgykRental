interface StatusBadgeProps {
  status: boolean;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return status ? (
    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
      Tersedia
    </span>
  ) : (
    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
      Tidak Tersedia
    </span>
  );
}