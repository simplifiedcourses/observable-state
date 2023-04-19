import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  observeOn,
  pipe,
  queueScheduler,
  Subject,
  takeUntil,
} from 'rxjs';

const filterAndCastToT = <T>() =>
  pipe(
    filter((v: T | null) => v !== null),
    map((v) => v as T)
  );

export class StateSubject<T> extends BehaviorSubject<T> {
  // never gets out of sync subscription wise
  // no more need for queueSchedulers?
  public readonly syncState = this.asObservable().pipe(map(() => observeOn(queueScheduler))) as Observable<T>
}

@Injectable()
export class ObservableState<T extends Record<string, unknown>>
  implements OnDestroy {
  private readonly notInitializedError =
    'Observable state is not initialized yet, call the initialize() method';
  private readonly destroy$$ = new Subject<void>();
  private readonly state$$ = new StateSubject<T | null>(null);
  /**
   * Return the entire state as an observable
   * Only use this if you want to be notified on every update. For better optimization
   * use the onlySelectWhen() method
   * where we can pass keys on when to notify.
   */
  public readonly state$ = this.state$$.syncState.pipe(
    filterAndCastToT<T>(),
    distinctUntilChanged((previous: T, current: T) =>
      Object.keys(current).every(
        (key: string) => current[key as keyof T] === previous[key as keyof T]
      )
    ),
    takeUntil(this.destroy$$)
  );

  /**
   * Get a snapshot of the current state. This method is needed when we want to fetch the
   * state in functions. We don't have to use withLatestFrom if we want to keep it simple.
   */
  public get snapshot(): T {
    if (!this.state$$.value) {
      throw new Error(this.notInitializedError);
    }
    return this.state$$.value as T;
  }

  /**
   * Observable state doesn't work without initializing it first. Our state always needs
   * an initial state. You can pass the @InputState() as an optional parameter.
   * Passing that @InputState() will automatically feed the state with the correct values
   * @param state
   * @param inputState$
   */
  public initialize(state: T, inputState$?: Observable<Partial<T>>): void {
    this.state$$.next(state); // pass initial state
    // Feed the state when the input state gets a new value
    inputState$?.pipe(
      takeUntil(this.destroy$$)
    ).subscribe((res: Partial<T>) => this.patch(res));
  }

  /**
   * This method is used to connect multiple observables to a partial of the state
   * pass in an object with keys that belong to the state with their observable
   * @param object
   */
  public connect(object: Partial<{ [P in keyof T]: Observable<T[P]> }>): void {
    Object.keys(object).forEach((key: keyof Partial<T>) => {
      object[key]?.pipe(
        takeUntil(this.destroy$$)
      ).subscribe((v: Partial<T>[keyof Partial<T>]) => {
        this.patch({ [key]: v } as Partial<T>);
      });
    });
  }

  /**
   * Returns the entire state when one of the properties matching the passed keys changes
   * @param keys
   */
  public onlySelectWhen(keys: (keyof T)[]): Observable<T> {
    return this.state$$.syncState.pipe(
      filterAndCastToT<T>(),
      distinctUntilChanged((previous: T, current: T) =>
        keys.every(
          (key: keyof T) =>
            current[key as keyof T] === previous[key as keyof T]
        )
      ),
      takeUntil(this.destroy$$)
    )
  }

  /**
   * Patch a partial of the state. It will loop over all the properties of the passed
   * object and only next the state once.
   * @param object
   */
  public patch(object: Partial<T>): void {
    if (!this.state$$.value) {
      throw new Error(this.notInitializedError);
    }
    let newState: T = { ...this.state$$.value };
    Object.keys(object).forEach((key: string) => {
      newState = { ...newState, [key]: object[key as keyof T] };
    });
    this.state$$.next(newState);
  }

  /**
   * Pick pieces of the state and create an object that has Observables for every key that is passed
   * @param keys
   */
  public pick<P>(
    keys: (keyof T)[]
  ): Partial<{ [P in keyof T]: Observable<T[P]> }> {
    const returnObj: Partial<{ [P in keyof T]: Observable<T[P]> }> = {};
    keys.forEach((key: keyof T) => {
      returnObj[key] = this.onlySelectWhen([key]).pipe(
        map((state: T) => state[key])
      );
    });
    return returnObj;
  }

  public ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
