/**
 * This method can be used to get the initial values of the input properties
 * This code is brittle since it uses ɵcmp which is internal angular code
 * While this removes boilerplate it might be better to just initialize with
 * the default input values manually
 * ```typescript
 * this.initialize({
 *  foo: this.foo,
 * })
 * ```
 * @param target
 */
export function getDefaultInputState<T>(target: any): T {
  const returnObj: T = {} as T;
  Object.keys(target.constructor.ɵcmp.inputs)
    .map((key) => target.constructor.ɵcmp.inputs[key])
    .forEach((inputKey: keyof T) => {
      returnObj[inputKey] = target[inputKey];
    });
  return returnObj;
}
