/** Clarity overrides for the command palette and the chrome parts the framework draws. */
export const commandSlots: Record<string, string> = {
  command: "rounded-none bg-popover",
  "command-input-wrapper": "h-[52px] gap-2.5 border-[var(--border)] px-4",
  "command-input-icon": "mr-0 size-[18px] text-muted-foreground opacity-100",
  "command-input": "h-[52px] py-0 text-[15px]",
  "command-empty": "p-8 text-[13.5px] text-muted-foreground",
  "command-group":
    "p-0 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:text-[11.5px] [&_[cmdk-group-heading]]:font-semibold",
  "command-separator": "bg-[var(--border)]",
  "command-item":
    "min-h-[38px] gap-2.5 rounded-[var(--radius-control)] px-2.5 py-0 text-[13.5px] data-[selected=true]:bg-[var(--surface-3)] data-[selected=true]:text-foreground [&_svg]:text-muted-foreground data-[selected=true]:[&_svg]:text-foreground",
};
