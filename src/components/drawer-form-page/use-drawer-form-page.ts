import type {
  DrawerFormPageApi,
  DrawerFormPageOpenOptions,
  DrawerFormPageOptions,
  DrawerFormValues,
} from './index.type';

import { defineComponent, h, reactive, ref, watch } from 'vue';

import DrawerFormPage from './index.vue';

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
  const drawerRef = ref<InstanceType<typeof DrawerFormPage>>();

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
            ...state,
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
