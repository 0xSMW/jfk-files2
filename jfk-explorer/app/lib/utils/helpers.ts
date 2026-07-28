export function getFileSystemSafeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_+/g, '_');
}

export function slugify(name: string): string {
  if (!name) return '';
  return getFileSystemSafeName(name);
}
