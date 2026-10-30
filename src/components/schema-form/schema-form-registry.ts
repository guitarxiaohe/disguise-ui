import type { Component } from 'vue';

import { shallowReactive } from 'vue';



export type SchemaFormComponent = Component;

export type SchemaFormComponentConfig = {
  component: SchemaFormComponent;
  modelProp?: string;
  updateEvent?: string;
  valueExtractor?: (value: any) => any;
};

export type SchemaFormComponentRegistration =
  | SchemaFormComponent
  | SchemaFormComponentConfig;

const componentRegistry = shallowReactive<
  Record<string, SchemaFormComponentRegistration>
>({});

function normalizeRegistration(
  registration: SchemaFormComponentRegistration,
): SchemaFormComponentConfig {
  if (
    typeof registration === 'object' &&
    registration !== null &&
    'component' in registration &&
    registration.component
  ) {
    return registration as SchemaFormComponentConfig;
  }
  return { component: registration as SchemaFormComponent };
}

/**
 * 注册 SchemaForm 可通过 schema.component 使用的组件。
 *
 * 默认按 v-model:modelValue 绑定。组件使用其他值属性时，可配置
 * modelProp 与 updateEvent，例如：
 * { component: MyCheckbox, modelProp: 'checked', updateEvent: 'update:checked' }
 */
export function registerSchemaFormComponents(
  components: Partial<Record<string, SchemaFormComponentRegistration>>,
) {
  for (const [name, registration] of Object.entries(components)) {
    if (registration) {
      componentRegistry[name] = registration;
    }
  }
}

export function resolveSchemaFormComponent(
  component:
    | SchemaFormComponent
    | SchemaFormComponentConfig
    | string
    | undefined,
): SchemaFormComponentConfig | undefined {
  if (!component) return undefined;

  if (typeof component !== 'string') {
    return normalizeRegistration(component);
  }

  const registration = componentRegistry[component];
  return registration ? normalizeRegistration(registration) : undefined;
}
