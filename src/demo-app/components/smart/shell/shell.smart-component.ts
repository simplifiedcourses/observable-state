import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { TopbarUiComponent } from '../../ui/topbar/topbar.ui-component';
import { ObservableState } from '../../../../state/observable-state';
import { FacadeService } from '../../../services/facade.service';
import { ShoppingCartEntry } from '../../../types/shopping-cart-entry';

type ShellState = {
  entries: ShoppingCartEntry[]
}

type ViewModel = {
  amount: number;
}
@Component({
  selector: 'sh-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarUiComponent],
  templateUrl: './shell.smart-component.html',
  styleUrls: ['./shell.smart-component.scss'],
})
export class ShellSmartComponent extends ObservableState<ShellState>{
  private readonly facade =  inject(FacadeService);
  private readonly shoppingCartObservableState = this.facade.shoppingCartObservableState;

  public readonly vm$ :Observable<ViewModel> = this.state$.pipe(
    map(({entries}) => {
      return {
        amount: entries.reduce((amount: number, item) => amount + item.amount, 0)
      }
    })
  );

  constructor() {
    super();
    this.initialize({
      entries: []
    });
    this.connect({
      ...this.shoppingCartObservableState.pick(['entries']),
    })
  }
}
