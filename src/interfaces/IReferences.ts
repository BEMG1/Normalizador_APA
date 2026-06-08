import type { Reference } from "@/components/References/ReferencesManager";

export interface IReferences {
  references: Reference[];
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
}
