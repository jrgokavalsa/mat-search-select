import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'multiSelectFilter',
})
export class MultiSelectFilterPipe implements PipeTransform {
  transform(options: string[], searchString: string): string[] {
    if (!searchString) {
      return options;
    }

    const filteredOptions: string[] = [];
    const lowerCaseSearch = searchString.toLowerCase();

    for (const option of options) {
      if (option.toLowerCase().includes(lowerCaseSearch)) {
        filteredOptions.push(option);
      }
    }

    return filteredOptions;
  }
}
