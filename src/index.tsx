import { ActionPanel, Action, List, getPreferenceValues } from "@raycast/api";
import { homedir } from "os";
import useSearch from "./useSearch";

const projectsDirectory: string = getPreferenceValues().projectsDirectory;
const editor: string = getPreferenceValues().editor;

export default function Command() {
  const directoriesToSearch = projectsDirectory
    .replace(/~/g, homedir())
    .replace(/\/{1,}$/, "") // remove any trailing slashes
    .split(",")
    .map((_) => _.trim());

  const { state, search } = useSearch(directoriesToSearch);

  return (
    <List
      isLoading={state.isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Search for a project..."
      throttle
    >
      <List.Section title="Results">
        {state.results.map(({ fullPath, result }) => (
          <SearchListItem key={fullPath} path={fullPath} title={result.name} />
        ))}
      </List.Section>
    </List>
  );
}

function SearchListItem({ title, path }: { title: string; path: string }) {
  return (
    <List.Item
      title={title}
      accessoryTitle={path}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Open title="Open in Editor" target={path} application={editor} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
