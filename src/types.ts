export interface RepositoryViewProps {
  title: string
  readContents: (objects: Record<string, true>) => Promise<{
    [objectPath: string]: string | null
  }>
  commitChanges: (changeset: Record<string, string | null>, commitMessage: string) => Promise<{
    success: true
  }>
}

interface MainPlugin {}

interface RendererPlugin {
  repositoryView?: Promise<(props: RepositoryViewProps) => any>
}

export type Plugin = MainPlugin | RendererPlugin;

