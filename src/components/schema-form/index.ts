export {
  registerSchemaFormComponents,
  resolveSchemaFormComponent,
} from './schema-form-registry';
export type {
  SchemaFormComponent,
  SchemaFormComponentConfig,
  SchemaFormComponentRegistration,
} from './schema-form-registry';
export type {
  ApiFieldOptions,
  FieldCondition,
  FieldContext,
  FieldOption,
  FieldOptionsResolver,
  FieldPropsContext,
  FieldPropsResolver,
  SchemaFormField,
  SchemaFormGroup,
  SchemaFormItem,
  SchemaFormMode,
  SchemaFormProps,
  SchemaFormSlotProps,
  TranslateCommand,
  TranslateConfig,
  TranslateHandlerContext,
  TranslateLanguage,
  TranslateLanguageValues,
} from './schema-form.type';
export { DEFAULT_TRANSLATE_LANGUAGES } from './schema-form.type';
export { default as SchemaForm } from './schema-form.vue';
