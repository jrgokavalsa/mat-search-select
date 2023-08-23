import { SelectionModel } from '@angular/cdk/collections';
import {
  ContentChild,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subject, takeUntil, tap } from 'rxjs';

@Directive({
  selector: '[multiSelectSearch]',
})
export class MultiSelectSearchDirective implements OnDestroy {
  @Input('matSearchInput') _searchInput!: HTMLInputElement;
  @Input('noResultsMessage') _noResultsMessage: string = 'No results found';
  @ContentChild('mClear') _mClear!: MatIconButton;
  @ContentChild('mCheck') _mCheck!: MatCheckbox;
  @ContentChild('matOptions') optionsPanel!: ElementRef;

  private _destroy$ = new Subject<void>();
  private _optionsSelected: SelectionModel<MatOption> =
    new SelectionModel<MatOption>(this.matSelect.multiple, []);

  private _noResultsclass = [
    'mat-mdc-option',
    'mdc-list-item',
    'mdc-list-item--disabled',
  ];

  constructor(
    private matSelect: MatSelect,
    private ngControl: NgControl,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    this._attachEventListener();
  }

  /** if no results found while filter then no result element in the dropdown else remove the no result element if present */
  _showNoOptions() {
    const panel = this.matSelect.panel;
    const optionLength = this.matSelect.options.length;
    if (!panel) return;
    optionLength == 0 ? this._addNoResults() : this._removeNoResults();
  }

  /** add no result element to the mat-options panel */
  _addNoResults() {
    const noResultsElement = this.renderer.createElement('mat-option');
    this._noResultsclass.forEach((className) =>
      this.renderer.addClass(noResultsElement, className)
    );
    this.renderer.setAttribute(noResultsElement, 'id', 'noResults');
    this.renderer.appendChild(
      noResultsElement,
      this.renderer.createText(this._noResultsMessage)
    );
    this.renderer.appendChild(
      this.optionsPanel.nativeElement,
      noResultsElement
    );
  }

  /** remove no result element if present */
  _removeNoResults() {
    const element: ElementRef =
      this.optionsPanel.nativeElement.querySelector('#noResults');
    if (!element) return;
    this.renderer.removeChild(this.optionsPanel.nativeElement, element);
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

    selectionMissing
      ? this._setCheckboxState(false)
      : this._setCheckboxState(true);
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
          this._showNoOptions();
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
   * listen to options on change
   */
  private _setupOptionsChangeListener() {
    this.matSelect.options.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._showNoOptions();
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
      .pipe(
        takeUntil(this._destroy$),
        tap((e: MatCheckboxChange) =>
          e.checked ? this._selectAll() : this._deselectAll()
        )
      )
      .subscribe();
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
    this._setupOptionsChangeListener();
    this._setupSelectAllListener();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
