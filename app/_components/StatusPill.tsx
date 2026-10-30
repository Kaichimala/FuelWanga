import type { Status } from "@/lib/types";
import { pillStyle, statusWord } from "@/lib/fuel";

export default function StatusPill({ status, prefix }: { status: Status; prefix?: string }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-[11px] py-[5px] text-[.85rem] font-semibold ${pillStyle[status]}`}
    >
      {prefix ? `${prefix}: ` : ""}
      {statusWord[status]}
    </span>
  );
}
