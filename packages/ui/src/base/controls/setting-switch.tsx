import { useId } from "react";

import { Flex } from "../../primitives/flex";
import { Label } from "./label";
import { Switch } from "../inputs/switch";

export interface SettingSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  id: idProp,
}: SettingSwitchProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <Flex align="start" justify="between" gap="sm">
      <div className="flex-1 min-w-0">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </Flex>
  );
}
