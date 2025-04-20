import React from "react";
import { SWRConfig } from "swr";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </SWRConfig>
    </QueryClientProvider>
  );
};
