import { computed, effect, Injectable, OnDestroy, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subject, takeUntil, } from 'rxjs';

@Injectable()
export class SignalState<T extends Record<string, unknown>> implements OnDestroy {
  private readonly notInitializedError =
    'Observable state is not initialized yet, call the initialize() method';
  private signals: { [P in keyof T]: WritableSignal<T[P]> } | undefined;
  public state: Signal<T> = computed(() => {
    if (!this.signals) {
      throw new Error(this.notInitializedError);
    }
    const state: Partial<T> = {};
    const keys = Object.keys(this.signals);
    keys.forEach((key: keyof T) => {
      if (!this.signals) {
        throw new Error(this.notInitializedError);
      }
      state[key] = this.signals[key]()
    })
    return state as T;
  })
  private readonly destroy$$ = new Subject<void>();

  public initialize<P extends keyof T>(state: T): void {
    const keys: P[] = Object.keys(state) as P[];
    const signals: Partial<{ [P in keyof T]: Signal<T[P]> }> = {};
    keys.forEach(key => {
      signals[key] = signal<T[P]>(state[key]);
    });
    this.signals = signals as { [P in keyof T]: WritableSignal<T[P]> };
  }

  public select<P extends keyof T>(key: P): Signal<T[P]> {
    if (!this.signals) {
      throw new Error(this.notInitializedError);
    }
    return this.signals[key]
  }

  /**
   * This method is used to connect multiple observables to a partial of the state
   * pass in an object with keys that belong to the state with their observable
   * @param object
   */
  public connectObservables(object: Partial<{ [P in keyof T]: Observable<T[P]> }>): void {
    Object.keys(object).forEach((key: keyof Partial<T>) => {
      object[key]?.pipe(
        takeUntil(this.destroy$$)
      ).subscribe((v: Partial<T>[keyof Partial<T>]) => {
        if (!this.signals) {
          throw new Error(this.notInitializedError);
        }
        this.patch({ [key]: v } as Partial<T>);
      });
    });
  }

  public connectSignals(object: Partial<{ [P in keyof T]: Signal<T[P]> }>): void {
    Object.keys(object).forEach((key: keyof Partial<T>) => {
      effect(() => {
        const v = object[key] as Signal<Partial<T>[keyof Partial<T>]>;
        this.patch({ [key]: v() } as Partial<T>)
      }, { allowSignalWrites: true })
    });
  }

  /**
   * Returns the entire state when one of the properties matching the passed keys changes
   * @param keys
   */

  public onlySelectWhen(keys: (keyof T)[]): Signal<T> {
    if (!this.signals) {
      throw new Error(this.notInitializedError);
    }
    const snapshot = this.state();
    const state = signal(snapshot);
    computed(() => {
      keys.forEach((key) => {
        this.select(key)();
      })
      state.set(this.state())
    })
    return state;
  }

  /**
   * Patch a partial of the state. It will loop over all the properties of the passed
   * object and only next the state once.
   * @param object
   */
  public patch<P extends keyof T>(object: Partial<T>): void {
    if (!this.signals) {
      throw new Error(this.notInitializedError);
    }
    (Object.keys(object) as P[]).forEach((key: P) => {
      (this.signals?.[key] as WritableSignal<T[P]>).set(object[key] as T[P]);
    });
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
