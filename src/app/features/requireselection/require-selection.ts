import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { User } from '../types/User';

@Component({
  selector: 'require-selection',
  templateUrl: './require-selection.html',
  styleUrls: ['./require-selection.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequireSelection implements OnInit {
  myControl = new FormControl<string | User>('');
  options: User[] = [
    { name: 'Mary', id: 1 },
    { name: 'Shelley', id: 2 },
    { name: 'Igor', id: 3 },
  ];
  filteredOptions!: Observable<User[]>;

  ngOnInit(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filter(name as string) : this.options.slice();
      })
    );
  }
  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter((option) =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
}
