import { showToast, Toast } from "@raycast/api";
import { useState, useCallback } from "react";
import { promises, Dirent } from "fs";
import { compareTwoStrings } from "string-similarity";

export interface SearchState {
  results: SearchResult[];
  isLoading: boolean;
}

export interface SearchResult {
  result: Dirent;
  fullPath: string;
  rating?: number;
}

export default function useSearch(directoriesToSearch: string[]) {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: true,
  });

  const search = useCallback(
    async function search(searchText: string) {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));
      try {
        const results = await performSearch(searchText, directoriesToSearch);
        setState((oldState) => ({
          ...oldState,
          results,
          isLoading: false,
        }));
      } catch (error) {
        setState((oldState) => ({
          ...oldState,
          isLoading: false,
        }));

        console.error("search error", error);
        showToast({ style: Toast.Style.Failure, title: "Could not perform search", message: String(error) });
      }
    },
    [setState]
  );

  return {
    state,
    search,
  };
}

async function performSearch(searchText: string, directoriesToSearch: string[]): Promise<SearchResult[]> {
  const resultsPerDirectory = await Promise.all(directoriesToSearch.map(searchDirectory));

  return resultsPerDirectory
    .flat()
    .filter((item) => item.result.isDirectory())
    .map((_) => ({ ..._, rating: compareTwoStrings(searchText, _.result.name) }))
    .filter((_) => _.rating > 0)
    .sort((a, b) => b.rating - a.rating);
}

async function searchDirectory(dirToSearch: string): Promise<SearchResult[]> {
  const results = await promises.readdir(dirToSearch, { withFileTypes: true });
  return results.map((result) => ({ fullPath: `${dirToSearch}/${result.name}`, result }));
}
