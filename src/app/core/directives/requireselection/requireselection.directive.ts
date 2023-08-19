import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';

@Directive({
  selector: '[requireSelection]',
})
export class RequireSelectionDirective {
  @Input('requireSelection') matAutoComplete!: MatAutocomplete;
  constructor(private ngControl: NgControl) {}

  @HostListener('blur')
  onBlur() {
    const value = this.ngControl.control?.value;
    const matchingOptions = this.matAutoComplete.options.find(
      (option) => JSON.stringify(option.value) == JSON.stringify(value)
    );
    if (!matchingOptions) {
      this.ngControl.control?.setValue(null);
      this.ngControl.control?.setErrors({ selectionRequired: true });
    }
  }
}
