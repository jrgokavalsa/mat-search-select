import { SelectionModel } from '@angular/cdk/collections';
import { ContentChild, Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subject, fromEvent, takeUntil } from 'rxjs';

@Directive({
  selector: '[multiSelectSearch]',
})
export class MultiSelectSearchDirective {
  @Input('matSearchInput') _searchInput!: HTMLInputElement;
  @ContentChild('mClear') _mClear!: MatIconButton;
  @ContentChild('mCheck') _mCheck!: MatCheckbox;

  private _destroy$ = new Subject<void>();

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // private _selectedValues: MatOption[] = [];
  private _optionsSelected = new SelectionModel<MatOption>(true, []);

  constructor(private matSelect: MatSelect, private ngControl: NgControl) {}

  ngAfterViewInit(): void {
    this._attachEventListener();
  }

  /** selects all the displayed options and set the checkbox state to true*/
  private _selectAll(): void {
    this._setCheckboxState(true);
    this.matSelect.options.forEach((option) => {
      this._setOptionSelected(option);
      option.select(true);
    });
  }

  /** deselects all the displayed options and set the checkbox state to false*/
  private _deselectAll(): void {
    this._setCheckboxState(false);
    this.matSelect.options.forEach((option) => {
      this._setOptionDeselected(option);
      option.deselect(true);
    });
  }

  _setOptionSelected(option: MatOption) {
    const selectedItems = this._optionsSelected.selected;
    const matOption = selectedItems.find(
      (item) => item.viewValue == option.viewValue
    );
    if (!matOption) this._optionsSelected.select(option);
  }

  _setOptionDeselected(option: MatOption) {
    const selectedItems = this._optionsSelected.selected;
    const matOption = selectedItems.find(
      (item) => item.viewValue == option.viewValue
    );
    if (matOption) this._optionsSelected.deselect(matOption);
  }

  /** focus the search input element */
  private _focusSearchInput() {
    this._searchInput.focus();
  }
  /** clear the search input element */
  private _clearSearchInput() {
    this._searchInput.value = '';
    this._setControlValue();
  }

  /** set checkbox state to either true or false*/
  private _setCheckboxState(state: boolean) {
    this._mCheck.checked = state;
  }

  private _setCheckboxStateOnInput() {
    if (this.matSelect.options.length == 0) {
      this._setCheckboxDisableState(true);
      return;
    }
    this._setCheckboxDisableState(false);
    const selectionMissing = this.matSelect.options.some(
      (option) =>
        !this._optionsSelected.selected.find(
          (matOption) => matOption['viewValue'] === option['viewValue']
        )
    );

    if (selectionMissing) {
      this._mCheck.checked = false;
      return;
    } else {
      this._mCheck.checked = true;
      return;
    }
  }

  private _setCheckboxDisableState(state: boolean) {
    this._mCheck.setDisabledState(state);
  }

  /**
   * subscribe to the dropdown state change
   * open: clear the searchInput and focus the element
   * close: clear the searchInput
   */
  private _setupSelectOpenListener() {
    this.matSelect.openedChange
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: boolean) => {
        if (event) {
          this._focusSearchInput();
          this._setCheckboxStateOnInput();
        }
        this._clearSearchInput();
      });
  }

  /**
   * subscribe to the options selection state change
   * open: clear the searchInput and focus the element
   * close: clear the searchInput
   */
  private _setupOptionSelectionListener() {
    this.matSelect.optionSelectionChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: MatOptionSelectionChange) => {
        event.source.selected
          ? this._setOptionSelected(event.source)
          : this._setOptionDeselected(event.source);
        this._setCheckboxStateOnInput();
      });
  }

  /**
   * attach click event listener to the clear button on matselect
   * clears the search input element
   */
  private _setupClearButtonClickListener() {
    const button = this._mClear._elementRef.nativeElement;
    button.addEventListener('click', () => {
      this._clearSearchInput();
    });
  }

  /**
   * listen to input on search input
   *
   */
  private _setupInputChangeListener() {
    fromEvent(this._searchInput, 'input')
      .pipe(takeUntil(this._destroy$))
      .subscribe((eve) => {
        this.matSelect.options.forEach((item) => {
          const position = this._optionsSelected.selected.findIndex(
            (selectedItem) => selectedItem.viewValue === item.viewValue
          );
          if (position != -1) {
            item.select(true);
          }
        });
        this._setCheckboxStateOnInput();
      });
  }

  /**
   * listen to change event on matcheckbox
   * checked true: select all the displayed options
   * checked false: deselect all the displayed options
   */
  private _setupSelectAllListener() {
    this._mCheck.change
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: MatCheckboxChange) => {
        if (event.checked) this._selectAll();
        else this._deselectAll();
      });
  }

  private _setControlValue() {
    const values = this._optionsSelected.selected.map((option) => option.value);
    this.ngControl.control?.setValue(values);
  }

  /** adds all the event listeners on matselect */
  private _attachEventListener(): void {
    this._setupClearButtonClickListener();
    this._setupSelectOpenListener();
    this._setupOptionSelectionListener();
    this._setupInputChangeListener();
    this._setupSelectAllListener();
  }
}
