import type { SetupContext, VNodeChild } from 'vue';

import { defineComponent, h, reactive } from 'vue';

import { ElButton, ElDialog } from 'element-plus';

/******************************** 弹窗 ********************************/

type ModalOptions = {
  cancelText?: string;
  closeOnClickModal?: boolean;
  closeOnPressEscape?: boolean;
  confirmText?: string;
  destroyOnClose?: boolean;
  footer?: boolean;
  fullscreenButton?: boolean;
  onCancel?: () => void;
  onClosed?: () => void;
  onConfirm?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  title?: string;
  zIndex?: number;
};

function readWidth(className: unknown) {
  const matched = String(className ?? '').match(/w-\[([^\]]+)\]/);
  const width = matched?.[1];
  if (!width) return '600px';
  return /^\d+$/.test(width) ? `${width}px` : width;
}

function readBoolean(value: unknown, fallback: boolean) {
  if (value === undefined) return fallback;
  return Boolean(value);
}

/**
 * 兼容原弹窗调用的轻量对话框。支持 open、close 和 setState。
 */
export function useVbenModal(options: ModalOptions = {}) {
  const state = reactive({
    cancelText: options.cancelText ?? '取消',
    closeOnClickModal: options.closeOnClickModal ?? true,
    closeOnPressEscape: options.closeOnPressEscape ?? true,
    confirmText: options.confirmText ?? '确定',
    destroyOnClose: options.destroyOnClose ?? false,
    footer: options.footer !== false,
    fullscreen: false,
    open: false,
    showClose: true,
    title: options.title ?? '',
    zIndex: options.zIndex ?? 2000,
  });

  function open() {
    if (state.open) return;
    state.open = true;
    options.onOpenChange?.(true);
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    options.onOpenChange?.(false);
  }

  function setState(patch: { footer?: boolean; fullscreen?: boolean; title?: string }) {
    if (typeof patch.fullscreen === 'boolean') state.fullscreen = patch.fullscreen;
    if (typeof patch.title === 'string') state.title = patch.title;
    if (typeof patch.footer === 'boolean') state.footer = patch.footer;
  }

  const Modal = defineComponent({
    name: 'DisguiseModal',
    inheritAttrs: false,
    setup(_: unknown, { attrs, slots }: SetupContext) {
      return () => {
        const showFooter = state.footer && !slots.footer;
        const dialogSlots: Record<string, () => VNodeChild> = {};
        if (slots.default) dialogSlots.default = () => slots.default?.();
        if (slots.title) dialogSlots.header = () => slots.title?.();
        if (slots.footer) {
          dialogSlots.footer = () => slots.footer?.();
        } else if (showFooter) {
          dialogSlots.footer = () => [
            h(
              ElButton,
              { onClick: () => options.onCancel?.() },
              () => String(attrs.cancelText ?? state.cancelText),
            ),
            h(
              ElButton,
              { type: 'primary', onClick: () => options.onConfirm?.() },
              () => String(attrs.confirmText ?? state.confirmText),
            ),
          ];
        }

        return h(
          ElDialog,
          {
            appendToBody: true,
            class: attrs.class,
            closeOnClickModal: readBoolean(
              attrs.closeOnClickModal,
              state.closeOnClickModal,
            ),
            closeOnPressEscape: readBoolean(
              attrs.closeOnPressEscape,
              state.closeOnPressEscape,
            ),
            destroyOnClose: state.destroyOnClose,
            fullscreen: state.fullscreen,
            modelValue: state.open,
            'onUpdate:modelValue': (value: boolean) => {
              if (value) open();
              else close();
            },
            onClosed: () => options.onClosed?.(),
            showClose: readBoolean(attrs.closable, state.showClose),
            title: slots.title ? '' : String(attrs.title ?? state.title),
            width: readWidth(attrs.class),
            zIndex: state.zIndex,
          },
          dialogSlots,
        );
      };
    },
  });

  return [Modal, { open, close, setState }] as const;
}
