import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { InputState } from '../../../../state/input-state-decorator';
import { ObservableState } from '../../../../state/observable-state';

type ViewModel = Readonly<{
  itemFrom: number;
  itemTo: number;
  total: number;
  previousDisabled: boolean;
  nextDisabled: boolean;
  showItemsPerPage: boolean;
  itemsPerPageOptions: number[];
}>;

type PagerInputState = {
  itemsPerPage: number;
  total: number;
  pageIndex: number;
}
type PagerState = PagerInputState & {
  showItemsPerPage: boolean;
  itemsPerPageOptions: number[];
}

@Component({
  selector: 'sh-pager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pager.ui-component.html',
  styleUrls: ['./pager.ui-component.scss'],
})
export class PagerUiComponent extends ObservableState<PagerState> {
  @InputState() inputState$!: Observable<PagerInputState>;

  @Input() public itemsPerPage = 0;
  @Input() public total = 0;
  @Input() public pageIndex = 0;

  constructor() {
    super();
    const {itemsPerPage, total, pageIndex} = this;
    this.initialize({
      itemsPerPage,
      total,
      pageIndex,
      showItemsPerPage: false,
      itemsPerPageOptions: [5, 10, 20]
    }, this.inputState$);
  }

  public readonly vm$: Observable<ViewModel> = this.state$
    .pipe(map(({ pageIndex, total, itemsPerPage, showItemsPerPage, itemsPerPageOptions }) => {
        return {
          total,
          previousDisabled: pageIndex === 0,
          nextDisabled: pageIndex >= Math.ceil(total / itemsPerPage) - 1,
          itemFrom: pageIndex * itemsPerPage + 1,
          showItemsPerPage,
          itemsPerPageOptions,
          itemTo:
            pageIndex < Math.ceil(total / itemsPerPage) - 1
              ? pageIndex * itemsPerPage + itemsPerPage
              : total,
        }
      })
    )

  @Output() public readonly pageIndexChange = new EventEmitter<number>();
  @Output() public readonly itemsPerPageChange = new EventEmitter<number>();

  public toggleShowItemsPerPage(): void {
    this.patch({ showItemsPerPage: !this.snapshot.showItemsPerPage });
  }

  public goToStart(): void {
    this.pageIndexChange.emit(0);
  }

  public next(): void {
    this.pageIndexChange.emit(this.pageIndex + 1);
  }

  public previous(): void {
    this.pageIndexChange.emit(this.pageIndex - 1);
  }

  public goToEnd(): void {
    this.pageIndexChange.emit(Math.ceil(this.total / this.itemsPerPage) - 1);
  }

  public itemsPerPageChanged(option: any): void {
    this.itemsPerPageChange.emit(+option?.target?.value)
  }
}
