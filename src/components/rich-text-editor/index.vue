<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

import { computed, ref, watch } from 'vue';

import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import {
  BackgroundColor,
  FontSize,
  LineHeight,
  TextStyle,
} from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Highlighter,
  ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Palette,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-vue-next';

import { $t as t } from '@/runtime/i18n';

type AlignValue = 'center' | 'justify' | 'left' | 'right';
type BlockType = 'blockquote' | 'h1' | 'h2' | 'h3' | 'paragraph';
type TableCommand =
  | 'addColumnAfter'
  | 'addColumnBefore'
  | 'addRowAfter'
  | 'addRowBefore'
  | 'deleteColumn'
  | 'deleteRow'
  | 'deleteTable'
  | 'insertTable';

const props = withDefaults(
  defineProps<{
    editable?: boolean;
    maxHeight?: string;
    modelValue?: string;
    placeholder?: string;
  }>(),
  {
    editable: true,
    maxHeight: '400px',
    modelValue: '',
    placeholder: '',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const FONT_FAMILIES = [
  { label: 'System Font', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
] as const;

const FONT_SIZES = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '32px',
] as const;

const sourceValue = ref(props.modelValue);
const sourceMode = ref(false);
const fullscreen = ref(false);
const editorVersion = ref(0);

const resolvedPlaceholder = computed(
  () => props.placeholder || t('components.richTextEditor.placeholder'),
);

const editor = useEditor({
  content: props.modelValue,
  editable: props.editable,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    TextStyle,
    Color,
    BackgroundColor,
    FontSize,
    LineHeight,
    FontFamily,
    Highlight.configure({ multicolor: true }),
    Underline,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Table.configure({
      HTMLAttributes: { class: 'rich-text-table' },
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: resolvedPlaceholder.value,
    }),
    Image.configure({
      allowBase64: true,
      inline: true,
    }),
    Link.configure({
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      openOnClick: true,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor-content',
    },
  },
  onSelectionUpdate: () => {
    editorVersion.value += 1;
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    sourceValue.value = html;
    editorVersion.value += 1;
    emit('update:modelValue', html);
  },
});

const editingDisabled = computed(() => !props.editable);

const blockType = computed<BlockType>({
  get() {
    void editorVersion.value;
    if (editor.value?.isActive('heading', { level: 1 })) return 'h1';
    if (editor.value?.isActive('heading', { level: 2 })) return 'h2';
    if (editor.value?.isActive('heading', { level: 3 })) return 'h3';
    if (editor.value?.isActive('blockquote')) return 'blockquote';
    return 'paragraph';
  },
  set(value) {
    setBlockType(value);
  },
});

const fontFamily = computed<string>({
  get() {
    void editorVersion.value;
    return String(editor.value?.getAttributes('textStyle').fontFamily ?? '');
  },
  set(value) {
    const chain = editor.value?.chain().focus();
    if (!chain) return;
    if (value) chain.setFontFamily(value).run();
    else chain.unsetFontFamily().run();
  },
});

const fontSize = computed<string>({
  get() {
    void editorVersion.value;
    return String(editor.value?.getAttributes('textStyle').fontSize ?? '16px');
  },
  set(value) {
    editor.value?.chain().focus().setFontSize(value).run();
  },
});

watch(
  () => props.modelValue,
  (value) => {
    const nextValue = value ?? '';
    sourceValue.value = nextValue;
    if (editor.value && editor.value.getHTML() !== nextValue) {
      editor.value.commands.setContent(nextValue, { emitUpdate: false });
    }
  },
);

watch(
  () => props.editable,
  (value) => {
    editor.value?.setEditable(value);
  },
);

watch(resolvedPlaceholder, (value) => {
  const placeholderExtension = editor.value?.extensionManager.extensions.find(
    (extension) => extension.name === 'placeholder',
  );
  if (!placeholderExtension) return;

  placeholderExtension.options.placeholder = value;
  editor.value?.view.dispatch(editor.value.state.tr);
});

function runEditorCommand(command: (editor: Editor) => void) {
  if (!editor.value || editingDisabled.value) return;
  command(editor.value);
  editorVersion.value += 1;
}

function setBlockType(value: BlockType) {
  runEditorCommand((editor) => {
    const chain = editor.chain().focus();
    if (value === 'paragraph') chain.setParagraph().run();
    if (value === 'h1') chain.toggleHeading({ level: 1 }).run();
    if (value === 'h2') chain.toggleHeading({ level: 2 }).run();
    if (value === 'h3') chain.toggleHeading({ level: 3 }).run();
    if (value === 'blockquote') chain.toggleBlockquote().run();
  });
}

function applySourceValue() {
  if (!editor.value || editor.value.getHTML() === sourceValue.value) return;
  editor.value.commands.setContent(sourceValue.value, { emitUpdate: true });
}

function toggleSourceMode() {
  if (sourceMode.value) {
    applySourceValue();
  } else {
    sourceValue.value = editor.value?.getHTML() ?? props.modelValue;
  }
  sourceMode.value = !sourceMode.value;
}

function addLink() {
  if (editingDisabled.value) return;
  const currentHref = editor.value?.getAttributes('link').href as
    | string
    | undefined;
  const url = window.prompt(
    t('components.richTextEditor.linkPrompt'),
    currentHref ?? '',
  );
  if (url === null) return;

  const nextUrl = url.trim();
  if (!nextUrl) {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  editor.value
    ?.chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: normalizeUrl(nextUrl) })
    .run();
}

function addImage() {
  if (editingDisabled.value) return;
  const url = window.prompt(t('components.richTextEditor.imagePrompt'));
  if (url) {
    editor.value?.chain().focus().setImage({ src: url.trim() }).run();
  }
}

function normalizeUrl(url: string) {
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  return 'https://' + url;
}

function setTextColor(event: Event) {
  const color = (event.target as HTMLInputElement).value;
  runEditorCommand((editor) => editor.chain().focus().setColor(color).run());
}

function setHighlightColor(event: Event) {
  const color = (event.target as HTMLInputElement).value;
  runEditorCommand((editor) =>
    editor.chain().focus().setBackgroundColor(color).run(),
  );
}

function setAlign(align: AlignValue) {
  runEditorCommand((editor) =>
    editor.chain().focus().setTextAlign(align).run(),
  );
}

function setLineHeight(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (!value) return;
  runEditorCommand((editor) =>
    editor.chain().focus().setLineHeight(value).run(),
  );
}

function runTableCommand(event: Event) {
  const select = event.target as HTMLSelectElement;
  const command = select.value as TableCommand;
  select.value = '';
  if (!command) return;

  runEditorCommand((editor) => {
    const chain = editor.chain().focus();
    if (command === 'insertTable')
      chain.insertTable({ cols: 3, rows: 3, withHeaderRow: true }).run();
    if (command === 'addColumnBefore') chain.addColumnBefore().run();
    if (command === 'addColumnAfter') chain.addColumnAfter().run();
    if (command === 'deleteColumn') chain.deleteColumn().run();
    if (command === 'addRowBefore') chain.addRowBefore().run();
    if (command === 'addRowAfter') chain.addRowAfter().run();
    if (command === 'deleteRow') chain.deleteRow().run();
    if (command === 'deleteTable') chain.deleteTable().run();
  });
}

function increaseIndent() {
  runEditorCommand((editor) =>
    editor.chain().focus().sinkListItem('listItem').run(),
  );
}

function decreaseIndent() {
  runEditorCommand((editor) =>
    editor.chain().focus().liftListItem('listItem').run(),
  );
}

function clearFormat() {
  runEditorCommand((editor) => {
    editor.chain().focus().clearNodes().unsetAllMarks().unsetTextAlign().run();
  });
}

const isActive = (name: string, attrs?: Record<string, unknown>) => {
  void editorVersion.value;
  return editor.value?.isActive(name, attrs) ?? false;
};

const isAlignActive = (align: AlignValue) => {
  void editorVersion.value;
  return (
    editor.value?.isActive({ textAlign: align }) ||
    (align === 'left' &&
      !['center', 'right', 'justify'].some((item) =>
        editor.value?.isActive({ textAlign: item }),
      ))
  );
};

defineExpose({ editor, clearFormat });
</script>

<template>
  <div
    v-if="editor"
    class="rich-text-editor"
    :class="{ 'is-fullscreen': fullscreen, 'is-source': sourceMode }"
  >
    <div class="rich-text-toolbar" @mousedown.prevent>
      <button
        type="button"
        :title="t('components.richTextEditor.undo')"
        @click="editor.chain().focus().undo().run()"
      >
        <Undo2 :size="17" />
      </button>
      <button
        type="button"
        :title="t('components.richTextEditor.redo')"
        @click="editor.chain().focus().redo().run()"
      >
        <Redo2 :size="17" />
      </button>

      <span class="rich-text-separator"></span>

      <button
        type="button"
        :title="t('components.richTextEditor.insertImage')"
        @click="addImage"
      >
        <ImageIcon :size="17" />
      </button>
      <label
        class="rich-text-select-wrap rich-text-select-wrap--line"
        :title="t('components.richTextEditor.lineHeight')"
      >
        <IndentIncrease :size="17" />
        <select :disabled="editingDisabled" @change="setLineHeight">
          <option value="">
            {{ t('components.richTextEditor.lineHeight') }}
          </option>
          <option value="1.2">1.2</option>
          <option value="1.5">1.5</option>
          <option value="1.75">1.75</option>
          <option value="2">2</option>
        </select>
      </label>

      <span class="rich-text-separator"></span>

      <button
        type="button"
        :class="{ 'is-active': isActive('bold') }"
        :title="t('components.richTextEditor.bold')"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <Bold :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('italic') }"
        :title="t('components.richTextEditor.italic')"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <Italic :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('underline') }"
        :title="t('components.richTextEditor.underline')"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <UnderlineIcon :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('strike') }"
        :title="t('components.richTextEditor.strike')"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <Strikethrough :size="17" />
      </button>

      <label
        class="rich-text-color"
        :title="t('components.richTextEditor.textColor')"
      >
        <Palette :size="17" />
        <input type="color" value="#111827" @input="setTextColor" />
      </label>
      <label
        class="rich-text-color"
        :title="t('components.richTextEditor.highlight')"
      >
        <Highlighter :size="17" />
        <input type="color" value="#fff3bf" @input="setHighlightColor" />
      </label>

      <span class="rich-text-separator"></span>

      <select
        v-model="fontFamily"
        class="rich-text-select rich-text-select--font"
        :disabled="editingDisabled"
      >
        <option
          v-for="font in FONT_FAMILIES"
          :key="font.label"
          :value="font.value"
        >
          {{ font.label }}
        </option>
      </select>
      <select
        v-model="fontSize"
        class="rich-text-select rich-text-select--size"
        :disabled="editingDisabled"
      >
        <option v-for="size in FONT_SIZES" :key="size" :value="size">
          {{ size }}
        </option>
      </select>
      <select
        v-model="blockType"
        class="rich-text-select rich-text-select--block"
        :disabled="editingDisabled"
      >
        <option value="paragraph">
          {{ t('components.richTextEditor.paragraph') }}
        </option>
        <option value="h1">
          {{ t('components.richTextEditor.heading1') }}
        </option>
        <option value="h2">
          {{ t('components.richTextEditor.heading2') }}
        </option>
        <option value="h3">
          {{ t('components.richTextEditor.heading3') }}
        </option>
        <option value="blockquote">
          {{ t('components.richTextEditor.blockquote') }}
        </option>
      </select>

      <span class="rich-text-separator"></span>

      <button
        type="button"
        :class="{ 'is-active': isAlignActive('left') }"
        :title="t('components.richTextEditor.alignLeft')"
        @click="setAlign('left')"
      >
        <AlignLeft :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isAlignActive('center') }"
        :title="t('components.richTextEditor.alignCenter')"
        @click="setAlign('center')"
      >
        <AlignCenter :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isAlignActive('right') }"
        :title="t('components.richTextEditor.alignRight')"
        @click="setAlign('right')"
      >
        <AlignRight :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isAlignActive('justify') }"
        :title="t('components.richTextEditor.alignJustify')"
        @click="setAlign('justify')"
      >
        <AlignJustify :size="17" />
      </button>

      <span class="rich-text-break"></span>

      <button
        type="button"
        :title="t('components.richTextEditor.decreaseIndent')"
        @click="decreaseIndent"
      >
        <IndentDecrease :size="17" />
      </button>
      <button
        type="button"
        :title="t('components.richTextEditor.increaseIndent')"
        @click="increaseIndent"
      >
        <IndentIncrease :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('orderedList') }"
        :title="t('components.richTextEditor.orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <ListOrdered :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('bulletList') }"
        :title="t('components.richTextEditor.bulletList')"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <List :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('code') }"
        :title="t('components.richTextEditor.code')"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <span class="rich-text-tx">T<sub>x</sub></span>
      </button>
      <button
        type="button"
        :title="t('components.richTextEditor.insertLink')"
        @click="addLink"
      >
        <Link2 :size="17" />
      </button>

      <label
        class="rich-text-select-wrap rich-text-select-wrap--table"
        :title="t('components.richTextEditor.table')"
      >
        <Table2 :size="17" />
        <select :disabled="editingDisabled" @change="runTableCommand">
          <option value="">{{ t('components.richTextEditor.table') }}</option>
          <option value="insertTable">
            {{ t('components.richTextEditor.insertTable') }}
          </option>
          <option value="addColumnBefore">
            {{ t('components.richTextEditor.addColumnBefore') }}
          </option>
          <option value="addColumnAfter">
            {{ t('components.richTextEditor.addColumnAfter') }}
          </option>
          <option value="deleteColumn">
            {{ t('components.richTextEditor.deleteColumn') }}
          </option>
          <option value="addRowBefore">
            {{ t('components.richTextEditor.addRowBefore') }}
          </option>
          <option value="addRowAfter">
            {{ t('components.richTextEditor.addRowAfter') }}
          </option>
          <option value="deleteRow">
            {{ t('components.richTextEditor.deleteRow') }}
          </option>
          <option value="deleteTable">
            {{ t('components.richTextEditor.deleteTable') }}
          </option>
        </select>
      </label>

      <span class="rich-text-separator"></span>

      <button
        type="button"
        :title="t('components.richTextEditor.fullscreen')"
        @click="fullscreen = !fullscreen"
      >
        <Minimize2 v-if="fullscreen" :size="17" />
        <Maximize2 v-else :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': sourceMode }"
        :title="t('components.richTextEditor.sourceCode')"
        @click="toggleSourceMode"
      >
        <Code2 :size="17" />
      </button>
      <button
        type="button"
        :title="t('components.richTextEditor.clearFormat')"
        @click="clearFormat"
      >
        <Eraser :size="17" />
      </button>
      <button
        type="button"
        :class="{ 'is-active': isActive('blockquote') }"
        :title="t('components.richTextEditor.blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <Quote :size="17" />
      </button>
      <div
        v-if="$slots['toolbar-append']"
        class="rich-text-toolbar-extension"
        @mousedown.stop
      >
        <slot name="toolbar-append"></slot>
      </div>
    </div>

    <textarea
      v-if="sourceMode"
      v-model="sourceValue"
      class="rich-text-source"
      :readonly="editingDisabled"
      :style="{ '--rich-text-max-height': maxHeight }"
      @blur="applySourceValue"
    ></textarea>
    <EditorContent
      v-else
      :editor="editor"
      :style="{ '--rich-text-max-height': maxHeight }"
    />
  </div>
</template>

<style scoped lang="scss">
.rich-text-editor {
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);

  &.is-fullscreen {
    position: fixed;
    inset: 16px;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    box-shadow: var(--el-box-shadow-dark);

    :deep(.tiptap-editor-content),
    .rich-text-source {
      flex: 1;
      max-height: none;
    }
  }
}

.rich-text-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  padding: 6px;
  background: #f8fafc;
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: inset 0 -1px 0 rgb(255 255 255 / 70%);

  button,
  .rich-text-color,
  .rich-text-select-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 7px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 6px;
    transition:
      background 0.15s,
      box-shadow 0.15s,
      color 0.15s,
      transform 0.15s;

    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color-blank);
      box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
    }

    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
    }

    &:active {
      transform: translateY(1px);
    }
  }

  svg {
    stroke-width: 1.9;
  }
}

.rich-text-toolbar-extension {
  display: flex;
  align-items: center;
  padding-left: 4px;
  border-left: 1px solid var(--el-border-color-lighter);
}

.rich-text-break {
  flex-basis: 100%;
  height: 1px;
  margin: 2px 0;
  background: var(--el-border-color-extra-light);
}

.rich-text-separator {
  width: 1px;
  height: 24px;
  margin: 0 3px;
  background: var(--el-border-color-lighter);
}

.rich-text-select {
  height: 32px;
  padding: 0 30px 0 11px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  appearance: none;
  cursor: pointer;
  outline: none;
  background-color: var(--el-fill-color-blank);
  background-image:
    linear-gradient(45deg, transparent 50%, var(--el-text-color-secondary) 50%),
    linear-gradient(135deg, var(--el-text-color-secondary) 50%, transparent 50%);
  background-repeat: no-repeat;
  background-position:
    calc(100% - 14px) 13px,
    calc(100% - 9px) 13px;
  background-size:
    5px 5px,
    5px 5px;
  border: 1px solid var(--el-border-color-extra-light);
  border-radius: 6px;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    background-color: #fff;
    border-color: var(--el-border-color);
  }

  &:focus {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
  }

  &--font {
    width: 148px;
  }

  &--size {
    width: 92px;
  }

  &--block {
    width: 132px;
  }
}

.rich-text-color {
  overflow: hidden;

  input[type='color'] {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    opacity: 0;
  }
}

.rich-text-select-wrap {
  gap: 5px;

  select {
    width: 16px;
    color: transparent;
    cursor: pointer;
    outline: none;
    background: transparent;
    border: 0;
  }

  &--line {
    min-width: 54px;
  }

  &--table {
    min-width: 48px;
  }
}

.rich-text-tx {
  font-family: Georgia, serif;
  font-size: 16px;
  font-style: italic;

  sub {
    font-size: 10px;
  }
}

.rich-text-source {
  width: 100%;
  min-height: 120px;
  max-height: var(--rich-text-max-height, 400px);
  padding: 14px 16px;
  overflow: auto;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  resize: vertical;
  outline: none;
  background: #fbfdff;
  border: 0;
}

:deep(.tiptap-editor-content) {
  min-height: 120px;
  max-height: var(--rich-text-max-height, 400px);
  padding: 14px 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  outline: none;

  p.is-editor-empty:first-child::before {
    float: left;
    height: 0;
    color: var(--el-text-color-placeholder);
    pointer-events: none;
    content: attr(data-placeholder);
  }

  h1 {
    margin: 0.8em 0 0.4em;
    font-size: 1.6em;
    font-weight: 700;
  }

  h2 {
    margin: 0.6em 0 0.3em;
    font-size: 1.3em;
    font-weight: 600;
  }

  h3 {
    margin: 0.5em 0 0.2em;
    font-size: 1.1em;
    font-weight: 600;
  }

  blockquote {
    padding: 4px 12px;
    margin: 8px 0;
    color: var(--el-text-color-secondary);
    border-left: 3px solid var(--el-color-primary-light-3);
  }

  pre {
    padding: 12px 16px;
    overflow-x: auto;
    font-family: 'Fira Code', Consolas, monospace;
    font-size: 13px;
    background: var(--el-fill-color);
    border-radius: var(--el-border-radius-base);

    code {
      padding: 0;
      background: none;
    }
  }

  code {
    padding: 1px 4px;
    font-size: 0.9em;
    background: var(--el-fill-color);
    border-radius: 3px;
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 8px 0;
    border-radius: var(--el-border-radius-base);
  }

  a {
    color: var(--el-color-primary);
    text-decoration: underline;
  }

  hr {
    margin: 16px 0;
    border: none;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  ul,
  ol {
    padding-left: 1.5em;
    margin: 4px 0;
  }

  .tableWrapper {
    overflow-x: auto;
  }

  table {
    width: 100%;
    margin: 10px 0;
    table-layout: fixed;
    border-collapse: collapse;

    th,
    td {
      min-width: 80px;
      padding: 8px;
      vertical-align: top;
      border: 1px solid var(--el-border-color);

      > * {
        margin: 0;
      }
    }

    th {
      font-weight: 600;
      background: var(--el-fill-color-light);
    }
  }

  .selectedCell::after {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    content: '';
    background: var(--el-color-primary-light-9);
  }

  .column-resize-handle {
    position: absolute;
    top: 0;
    right: -2px;
    bottom: -2px;
    width: 4px;
    pointer-events: none;
    background-color: var(--el-color-primary);
  }

  &.resize-cursor {
    cursor: ew-resize;
  }
}
</style>
