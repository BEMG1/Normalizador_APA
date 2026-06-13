import type { Reference } from "@/utils/referenceUtils";

export interface IReferences {
  references: Reference[];
  setReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
}
