# Observable state repo

This repository explains a custom implementation about Observable State explained in these articles (newest to oldest):
- [How to prepare for Angular signals](https://blog.simplified.courses/how-to-prepare-for-angular-signals/)
- [Evolving from the SIP principle towards observable state](https://blog.simplified.courses/evolving-from-the-sip-principle-towards-observable-state/)
- [Observable component state in Angular](https://blog.simplified.courses/observable-state-in-smart-components/)
- [Observable state for ui components in Angular](https://blog.simplified.courses/observable-state-in-angular-ui-components/)
- [Reactive input state for Angular ViewModels](https://blog.simplified.courses/reactive-input-state-for-angular-viewmodels/)
- [Reactive ViewModels for Ui components in Angular](https://blog.simplified.courses/reactive-viewmodels-for-ui-components-in-angular/)

## How to use observable state for ui components

```typescript
import { InputState } from './input-state-decorator';
import { ObservableState } from './observable-state';
type MyUiComponentInputState = {
  firstName: string;
  lastNam: string;
  age: number;
}
type MyUiComponentState = MyUiComponentInputState & {
  showAge: number;
}
@Component({
  template: `
    <ng-container *ngIf="vm$|async as vm">
        <p>First Name: {{vm.firstName}}</p>
        <p>Last Name: {{vm.lastName}}</p>
        <p *ngIf="vm.showAge">Age: {{vm.age}}</p>
        <button (click)="toggle()">Toggle Age</button>
    </ng-container>
  `
})
export class MyUiComponent extends ObservableState<MyUiComponentState> {
  @InputState() public readonly inputState$!: ObservableState<MyUiComponentInputState>
  @Input() public firstName = '';
  @Input() public lastName = '';
  @Input() public age = 0;
    
  constructor() {
    super();
    this.initialize({
      firstName: 'Brecht',
      lastName: 'Billiet',
      age: 35,
      showAge: false,
    }, this.inputState$)
  }
  
  public readonly vm$ = this.state$;
  
  public toggle(): void {
      this.patch({showAge: !this.snapshot.showAge})
  }
}
```

## Adding more reactive stuff

In the following example we added `time` to show the current time every second.

```typescript
import { InputState } from './input-state-decorator';
import { ObservableState } from './observable-state';

type MyUiComponentInputState = {
  firstName: string;
  lastNam: string;
  age: number;
}
type MyUiComponentState = MyUiComponentInputState & {
  showAge: number;
  time: number;
}

@Component({
  template: `
    <ng-container *ngIf="vm$|async as vm">
        <p>First Name: {{vm.firstName}}</p>
        <p>Last Name: {{vm.lastName}}</p>
        <p *ngIf="vm.showAge">Age: {{vm.age}}</p>
        The time is {{vm.time|date:'hh:mm:ss'}}
        <button (click)="toggle()">Toggle Age</button>
    </ng-container>
  `
})
export class MyUiComponent extends ObservableState<MyUiComponentState> {
  @InputState() public readonly inputState$!: ObservableState<MyUiComponentInputState>
  @Input() public firstName = '';
  @Input() public lastName = '';
  @Input() public age = 0;

  constructor() {
    super();
    this.initialize({
      firstName: 'Brecht',
      lastName: 'Billiet',
      age: 35,
      showAge: false,
      time: new Date().getTime()
    }, this.inputState$);
    this.connect({ time: interval(1000).pipe(map(() => new Date().getTime())) })
  }

  public readonly vm$ = this.state$;

  public toggle(): void {
    this.patch({ showAge: !this.snapshot.showAge })
  }
}
```

## Run demo

Run backend with 
```shell
json-server backend/db.json
```

Run frontend with
```shell
npm start
```
