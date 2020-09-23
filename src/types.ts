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
  repositoryView?: Promise<React.FC<RepositoryViewProps>>
}

export type Plugin = MainPlugin | RendererPlugin;

