export type DocumentType = 'TEXT';

export interface RagDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  fileUrl?: string | null;
  characterId?: string;
  contextId?: string;
}
