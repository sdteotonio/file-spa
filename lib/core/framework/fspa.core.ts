import { Value } from "../../public/fspa-public-models";

class FSPACore {
  buildTemplate(instance: HTMLElement, templateString) {
    templateString = this.setSimpleBind(templateString, instance);
    templateString = this.setForBind(templateString, instance);
    return templateString;
  }

  setForBind(templateString, instance) {
    const templateForBindsRegex = /\*for=["a-z]*/gm;
    const templateBindsKeys = String(templateString).match(
      templateForBindsRegex
    );
    if (templateBindsKeys) {
      const d = document.createElement("div");
      d.innerHTML = templateString;
      d.childNodes.forEach((node) => {
        const nodeElement = node as HTMLElement;
        const forAttribute = nodeElement.attributes?.getNamedItem("*for");
        if (nodeElement.attributes?.length && forAttribute) {
          const attributeValue: Value<any> = instance[forAttribute.value];
          if (attributeValue.value instanceof Array) {
            setValueParent(attributeValue, instance);
            nodeElement.removeAttribute("*for");
            const localTemplate = String(nodeElement.outerHTML);
            nodeElement.innerHTML = attributeValue.value
              .map((value) => {
                return this.simpleReplace(localTemplate, "{{#item}}", value);
              })
              .join("");
          }
        }
      });
      return d.outerHTML;
    }
    return templateString;
  }

  setSimpleBind(templateString, instance) {
    const templateBindsRegex = /{{\w(.*?)}}/gm;
    const templateBindsKeys = String(templateString).match(templateBindsRegex);
    if (templateBindsKeys) {
      for (const keyBind of templateBindsKeys) {
        const prop = (/{{(.*?)}}/.exec(keyBind) || "")[1];
        const value = instance[prop] ? instance[prop] : "";
        setValueParent(value, instance);
        templateString = templateString.replace(
          new RegExp(keyBind, "g"),
          value
        );
      }
    }
    return templateString;
  }

  simpleReplace(templateString: string, matchString: string, value) {
    templateString = templateString.replace(
      new RegExp(matchString, "g"),
      value
    );
    return templateString;
  }
}

function setValueParent<T>(value: Value<T>, instance: any) {
  if (value instanceof Object && !value.fspaParentRef) {
    value.fspaParentRef = instance;
  }
}
window["FSPACore"] = new FSPACore();
