export enum FSPATemplateComponentKeys {
  TAG = "#TAG",
  CLASS_NAME = "#CLASS_NAME",
  TEMPLATE = "#TEMPLATE",
  STYLE = "#STYLE",
}

export interface FSPATemplateReplacerModel<T> {
  key: T;
  value: string;
}

export function templateReplace<T>(
  replacers: FSPATemplateReplacerModel<T>[],
  templateContent: string
): string {
  let templateReplaced = String(templateContent);
  replacers?.forEach((replacer) => {
    templateReplaced = templateReplaced.replace(
      new RegExp(replacer.key as string, "g"),
      replacer.value
    );
  });
  return templateReplaced;
}
