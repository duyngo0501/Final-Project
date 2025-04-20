/*
  This file is used to generate the OpenAPI types for the project.
  Ref: https://kubb.dev/plugins/plugin-react-query/
*/
import { pluginOas } from "@kubb/plugin-oas";
import { defineConfig } from "@kubb/core";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";
import { pluginReactQuery } from "@kubb/plugin-react-query";
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
      // pluginReactQuery({
      //   output: {
      //     path: 'query',
      //     // Generate named exports for easier importing
      //     // Optional: Add a banner to generated files
      //     banner: '/* eslint-disable no-alert, no-console */',
      //   },
      //   // Configure client options
      //   client: {
      //     // Use axios as the default client
      //     importPath: '@kubb/plugin-client/clients/fetch',
      //     // Return full response config
      //     dataReturnType: 'full',
      //   },
      //   // Configure query methods
      //   query: {
      //     // Only generate query hooks for GET methods
      //     methods: ['get'],
      //     // Use @tanstack/react-query for hooks
      //     importPath: '@tanstack/react-query',
      //   },
      //   // Configure mutation methods
      //   mutation: {
      //     // Generate mutation hooks for POST, PUT, DELETE methods
      //     methods: ['post', 'put', 'delete'],
      //   },
      //   // Optional: Enable suspense support for React 18+
      //   suspense: {},
      //   // Optional: Group generated files by OpenAPI tags
      //   group: {
      //     type: 'tag',
      //     name: ({ group }) => `${group}Hooks`,
      //   },
      //   // Optional: Customize query key generation
      //   // queryKey: ({ operation }) => [operation.method, operation.path],
      // }),

      // pluginRedoc({
      //   output: {
      //     path: './docs/api.html',
      //   },
      // }),
    ],
  };
});
