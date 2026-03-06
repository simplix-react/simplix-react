import { registerPlugin, registerSchemaAdapter } from "@simplix-react/cli";
import type { I18nEntityInfo } from "@simplix-react/cli";
import { simplixBootNaming } from "./naming.js";
import { bootSchemaAdapter } from "./schema-adapter.js";
import {
  downloadI18nMessages,
  buildEntityKeyMap,
  transformToLocaleData,
} from "./i18n.js";

const I18N_ENDPOINT = "/api/v1/dev/i18n/messages";

// Register the boot plugin (spec profile + response adapter)
registerPlugin({
  id: "simplix-boot",
  specs: {
    "simplix-boot": {
      naming: simplixBootNaming,
      responseAdapter: "boot",
      mutatorHint: {
        errorAdapterImport:
          'import { bootResponseAdapter } from "@simplix-react-ext/simplix-boot-auth"',
        errorAdapterExpression: "{ toError: bootResponseAdapter.toError }",
      },
      mutatorStrategy: "boot",
      dependencies: {
        "@simplix-react-ext/simplix-boot-auth": "workspace:*",
      },
      i18nEndpoint: I18N_ENDPOINT,
      async i18nDownloader(
        serverOrigin: string,
        entities: I18nEntityInfo[],
        locales: string[],
      ) {
        const serverData = await downloadI18nMessages(serverOrigin, I18N_ENDPOINT);
        if (!serverData) return undefined;
        const entityKeyMap = buildEntityKeyMap(entities);
        const localeDataMap = transformToLocaleData(serverData, entityKeyMap, locales);
        return localeDataMap.size > 0 ? localeDataMap : undefined;
      },
    },
  },
  responseAdapters: {
    boot: {
      errorAdapterImport:
        'import { bootResponseAdapter } from "@simplix-react-ext/simplix-boot-auth"',
      errorAdapterName: "bootResponseAdapter",
      mockResponseWrapper: "wrapEnvelope",
      mockResponseWrapperImport:
        'import { wrapEnvelope } from "@simplix-react-ext/simplix-boot-auth"',
    },
  },
});

// Register the boot schema adapter for envelope unwrapping
registerSchemaAdapter(bootSchemaAdapter);
