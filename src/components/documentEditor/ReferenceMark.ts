import { Mark, mergeAttributes } from '@tiptap/core';

export interface ReferenceMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reference: {
      setReference: (id: string) => ReturnType;
      toggleReference: (id: string) => ReturnType;
      unsetReference: () => ReturnType;
    };
  }
}

export const ReferenceMark = Mark.create<ReferenceMarkOptions>({
  name: 'reference',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded cursor-pointer transition-colors hover:bg-blue-200 dark:hover:bg-blue-800/60',
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-reference-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.id) {
            return {};
          }
          return {
            'data-reference-id': attributes.id,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-reference-id]',
      },
      {
        tag: 'span[data-reference-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setReference:
        (id: string) =>
        ({ commands }: any) => {
          return commands.setMark(this.name, { id });
        },
      toggleReference:
        (id: string) =>
        ({ commands }: any) => {
          return commands.toggleMark(this.name, { id });
        },
      unsetReference:
        () =>
        ({ commands }: any) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
