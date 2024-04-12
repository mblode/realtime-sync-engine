import { observable, action } from "mobx";

export function createModel(initialData: any = {}) {
  const model = observable({
    ...initialData,
    save: action(function () {
      this.executeTransaction();
    }),
    executeTransaction() {
      console.log("Executing transaction for model:", this);
    },
    toJSON() {
      console.log("Converting model to JSON:", this);
      return {
        ...this,
      };
    },
  });

  return model;
}

export function property(value: any) {
  return observable(value);
}

export function manyToOne<T extends ReturnType<typeof createModel>>(
  relatedModel: T,
  inverseProperty: keyof T
) {
  return observable(relatedModel, {
    set(value: T) {
      this.value = value;
      if (value) {
        (value[inverseProperty] as any).add(this);
      }
    },
  });
}

export function oneToMany<T extends ReturnType<typeof createModel>>(
  relatedModels: T[],
  inverseProperty: keyof T
) {
  return observable(relatedModels, {
    set(values: T[]) {
      this.value = values;
      values.forEach((value) => {
        (value[inverseProperty] as any) = this;
      });
    },
  });
}
