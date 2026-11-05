import type {
  DrawerFormPageApi,
  DrawerFormPageOpenOptions,
  DrawerFormPageOptions,
  DrawerFormPageProps,
  DrawerFormValues,
} from './index.type';

import { defineComponent, h, reactive, ref, watch } from 'vue';

import DrawerFormPage from './index.vue';

/** DrawerFormPage 实例上实际用到的方法，避免 InstanceType 触发过深的类型实例化 */
interface DrawerFormPageInstance {
  getValues: () => DrawerFormValues;
  resetFields: () => void;
  submit: () => Promise<boolean>;
  toggleFullscreen: () => void;
  validate: () => Promise<boolean>;
}

export function useDrawerFormPage<
  TValues extends DrawerFormValues = DrawerFormValues,
>(options: DrawerFormPageOptions<TValues> = {}) {
  const {
    closeOnSubmit = true,
    initialValues,
    onCancel,
    onOpenChange,
    onSubmit,
    values: defaultValues,
    ...defaultState
  } = options;

  const visible = ref(false);
  const values = ref<TValues>(
    cloneValues(defaultValues ?? initialValues ?? ({} as TValues)),
  );
  const state = reactive<DrawerFormPageOpenOptions<TValues>>({
    ...defaultState,
  });
  const drawerRef = ref<DrawerFormPageInstance>();

  let api: DrawerFormPageApi<TValues>;

  function open(nextOptions: DrawerFormPageOpenOptions<TValues> = {}) {
    const { values: nextValues, ...nextState } = nextOptions;
    Object.assign(state, nextState);
    values.value = cloneValues(nextValues ?? initialValues ?? ({} as TValues));
    visible.value = true;
  }

  function close() {
    visible.value = false;
  }

  function toggleFullscreen() {
    drawerRef.value?.toggleFullscreen();
  }

  function setValues(nextValues: Partial<TValues>) {
    values.value = {
      ...values.value,
      ...nextValues,
    };
  }

  function getValues() {
    return (drawerRef.value?.getValues() ?? values.value) as TValues;
  }

  function validate() {
    return drawerRef.value?.validate() ?? Promise.resolve(false);
  }

  function resetFields() {
    drawerRef.value?.resetFields();
  }

  function submit() {
    return drawerRef.value?.submit() ?? Promise.resolve(false);
  }

  function setState(nextState: DrawerFormPageOpenOptions<TValues>) {
    const { values: nextValues, ...rest } = nextState;
    Object.assign(state, rest);
    if (nextValues !== undefined) {
      values.value = cloneValues(nextValues);
    }
  }

  api = {
    close,
    getValues,
    open,
    resetFields,
    setState,
    setValues,
    submit,
    toggleFullscreen,
    validate,
  };

  watch(visible, (isVisible) => {
    onOpenChange?.(isVisible);
  });

  const Drawer = defineComponent({
    name: 'DrawerFormPageProvider',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          DrawerFormPage,
          {
            ...attrs,
            // 收窄为具体 props 类型，避免 reactive 的 UnwrapRef 泛型递归导致类型实例化过深
            ...(state as Partial<DrawerFormPageProps>),
            ref: drawerRef,
            modelValue: visible.value,
            formValues: values.value,
            'onUpdate:modelValue': (value: boolean) => {
              visible.value = value;
            },
            'onUpdate:formValues': (nextValues: DrawerFormValues) => {
              values.value = nextValues as TValues;
            },
            'onUpdate:fullscreen': (fullscreen: boolean) => {
              state.fullscreen = fullscreen;
            },
            onCancel: () => {
              onCancel?.();
            },
            onSubmit: async (nextValues: DrawerFormValues) => {
              const result = await onSubmit?.(nextValues as TValues, api);
              if (result !== false && closeOnSubmit) {
                close();
              }
            },
          },
          slots,
        );
    },
  });

  return [Drawer, api] as const;
}

function cloneValues<TValues extends DrawerFormValues>(values: TValues) {
  return { ...values };
}
