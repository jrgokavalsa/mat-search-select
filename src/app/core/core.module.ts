import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MultiSelectSearchDirective } from './directives/multiselectsearch/multiselectsearch.directive';
import { RequireSelectionDirective } from './directives/requireselection/requireselection.directive';
import { MultiSelectFilterPipe } from './pipes/multi-select-filter.pipe';

@NgModule({
  declarations: [
    MultiSelectFilterPipe,
    RequireSelectionDirective,
    MultiSelectSearchDirective,
  ],
  imports: [CommonModule],
  exports: [
    MultiSelectFilterPipe,
    RequireSelectionDirective,
    MultiSelectSearchDirective,
  ],
})
export class CoreModule {}
