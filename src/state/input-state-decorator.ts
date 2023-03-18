import { SimpleChange } from '@angular/core';
import { InputStateModel } from './input-state-model';
import { TypedSimpleChanges } from './typed-simple-changes';

/**
 * This handy decorator uses the InputStateModel and can create reactive input state
 * @constructor
 */
export function InputState<T>() {
  return function (target: any, key: string): any {
    // This secretModel will actually be kept as a property on the instance of
    // the component that uses this InputState decorator
    const secretInputModel = `secret${key}Model`;
    // This accessor is used to get access to the secretInputModel
    // This property will not exist on the instance of the component
    // that uses this InputState decorator
    const accessorInputModel = `accessor${key}Model`;

    // Keep track of the original 3 lifecycle hooks
    const origNgOnChanges = target.constructor.prototype.ngOnChanges;
    const origNgOnDestroy = target.constructor.prototype.ngOnDestroy;
    const origNgOnInit = target.constructor.prototype.ngOnInit;

    // overwrite the origin ngOnInit life cycle hook
    target.ngOnInit = function (): void {
      const simpleChangesToPass: TypedSimpleChanges<T> = {};
      Object.keys(this.constructor.ɵcmp.inputs)
        .map((key) => this.constructor.ɵcmp.inputs[key])
        .forEach((inputKey) => {
          simpleChangesToPass[inputKey] = new SimpleChange(
            this[inputKey],
            this[inputKey],
            true
          );
        });

      this[accessorInputModel].update(simpleChangesToPass);

      // if ngOnChanges is implemented execute it as well
      if (origNgOnInit) {
        origNgOnInit.apply(this);
      }
    };

    // overwrite the original ngOnChanges life cycle hook
    target.ngOnChanges = function (simpleChanges: TypedSimpleChanges<T>): void {
      // send changes to model
      this[accessorInputModel].update(simpleChanges); // send changes to model

      // if ngOnChanges is implemented execute it as well
      if (origNgOnChanges) {
        origNgOnChanges.apply(this, [simpleChanges]);
      }
    };

    // Overwrite the original ngOnDestroy life cycle hook
    target.ngOnDestroy = function (): void {
      // If ngOnDestroy is implemented execute it too
      if (origNgOnDestroy) {
        origNgOnDestroy.apply(this, []);
      }

      // Clean up the instance InputStateModel
      this[accessorInputModel].ngOnDestroy();
    };

    // We need to keep InputStateModel on the instance
    // Since this decorator is static we need to use this syntax
    // to get access to this
    Object.defineProperty(target, accessorInputModel, {
      get: function () {
        // If it doesn't exist yet, create the InputStateModel
        if (!this[secretInputModel]) {
          this[secretInputModel] = new InputStateModel();
        }
        // return the InputStateModel
        return this[secretInputModel];
      },
    });

    // This is what the decorator will return
    // (the actual input state of the InputStateModel)
    return {
      get: function () {
        return this[accessorInputModel].state$;
      },
    };
  };
}
