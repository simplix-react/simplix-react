import { createContext } from "react";

import type { UIComponents } from "./types";

export const UIComponentContext = createContext<Partial<UIComponents>>({});
