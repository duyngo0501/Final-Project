/*
  This file is used to generate the OpenAPI types for the project.
  Ref: https://kubb.dev/plugins/plugin-react-query/
*/
import { pluginOas } from "@kubb/plugin-oas";
import { defineConfig } from "@kubb/core";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginSwr } from "@kubb/plugin-swr";
import { pluginClient } from "@kubb/plugin-client";
import { pluginRedoc } from "@kubb/plugin-redoc";
const COMMON_BANNER = "// Auto-generated React Query hooks from OpenAPI spec";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig(() => {
  return {
    root: ".",
    input: {
      path: "http://localhost:8000/api/v1/openapi.json",
    },
    output: {
      path: "./src/gen",
      write: true,
      clean: true,
      banner: "// Auto-generated React Query hooks from OpenAPI spec",
    },
    plugins: [
      pluginOas({
        validate: true,
        output: {
          path: "oas",
        },
      }),
      pluginTs({
        output: {
          path: "types",
        },
      }),
      pluginZod({
        output: {
          path: "zod",
        },
      }),
      pluginClient({
        output: {
          path: "client",
        },
        // parser: 'zod',
        dataReturnType: "full",
        importPath: "@/client",
      }),
      pluginSwr({
        output: {
          path: "query",
        },
        client: {
          dataReturnType: "full",
          importPath: "@/client",
        },
        group: {
          type: "tag",
          name: ({ group }) => `${group}Hooks`,
        },
      }),
    ],
  };
});
