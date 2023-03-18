import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { TypedSimpleChanges } from './typed-simple-changes';

/**
 * Used by the @InputState() decorator to create reactive input state
 */
@Injectable()
export class InputStateModel<T extends Record<string, any>> implements OnDestroy {
  // This injectable will get destroyed when the component who
  // provides this instance is destroyed, We will use the takeUntil operator
  // to cleanup every subscription to state$
  private readonly destroy$$ = new Subject<void>();

  // The update function will create the state$$ BehaviorSubject
  // We will use this initialized$$ BehaviorSubject to only expose state
  // when this instance is initialized
  private readonly initialized$$ = new BehaviorSubject<boolean>(false);

  // This will be created and nexted in the update function
  // This holds the value of all the @Input() properties
  private state$$: BehaviorSubject<T> | undefined;

  // Expose a state$ observable when this instance is initialized
  public readonly state$: Observable<T> = this.initialized$$.pipe(
    filter((v) => !!v), // Only expose the state when initialized
    switchMap(() => {
      // This is here to avoid typescript compilation issues
      if (!this.state$$) {
        throw new Error(
          'State must be initialized. Did you forgot to call the update method?'
        );
      }
      return this.state$$;
    }),
    // Only emits when one or more of the @Input() properties change
    distinctUntilChanged((previous: T, current: T) => {
      const keys = Object.keys(current);
      return keys.every((key) => {
        return current[key] === previous[key];
      });
    }),
    // Clean up after ngOnDestroy
    takeUntil(this.destroy$$)
  );

  // Next the destroy$$ subject when this instance gets destroyed
  // This is used to avoid memory leaks
  public ngOnDestroy(): void {
    this.destroy$$.next();
  }

  /**
   * Will be called from within the ngOnChanges
   * life cycle hook
   **/
  public update(changes: TypedSimpleChanges<T>): void {
    const keys = Object.keys(changes);
    // If the state$$ BehaviorSubject is not created yet
    // (initial ngOnChanges):
    // Create a state for all @Input() properties
    // Create a new BehaviorSubject with that state,
    // and set the initialized$$ to true
    if (!this.state$$) {
      const state: T = {} as T;
      keys.forEach((key) => {
        state[key as keyof T] = changes[key].currentValue;
      });
      this.state$$ = new BehaviorSubject<T>(state);
      this.initialized$$.next(true);
      // If the state already exists:
      // Take the current state and only update the state with inputs
      // if the current value is different from the previous value
    } else {
      const state: T = { ...this.state$$?.value } as T;
      keys.forEach((key) => {
        if (changes[key].currentValue !== changes[key].previousValue) {
          state[key as keyof T] = changes[key].currentValue;
        }
      });
      // Only create one event for all @Input() properties
      this.state$$.next(state);
    }
  }
}
