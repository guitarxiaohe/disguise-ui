export interface VersionInfo {
  version: string;
  hash: string;
  branch: string;
  buildTime: string;
  releaseNotes: string[];
  commits: Array<{
    hash: string;
    date: string;
    author: string;
    subject: string;
  }>;
}

export async function fetchVersion(): Promise<VersionInfo> {
  const response = await fetch('/version.json?t=' + Date.now(), {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}
