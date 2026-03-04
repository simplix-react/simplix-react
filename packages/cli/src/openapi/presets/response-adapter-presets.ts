import type { ResponseAdapterPreset } from "../response-adapter.js";

export const RESPONSE_ADAPTER_PRESETS: Record<string, ResponseAdapterPreset> = {
  boot: {
    // bootMutator already unwraps the envelope at fetch layer — no hook-level unwrap needed
    errorAdapterImport:
      'import { bootResponseAdapter } from "@simplix-react-ext/simplix-boot-auth"',
    errorAdapterName: "bootResponseAdapter",
    mockResponseWrapper: "wrapEnvelope",
    mockResponseWrapperImport:
      'import { wrapEnvelope } from "@simplix-react-ext/simplix-boot-auth"',
  },
};
