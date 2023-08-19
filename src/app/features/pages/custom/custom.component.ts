import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-custom',
  templateUrl: './custom.component.html',
  styleUrls: ['./custom.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomComponent {}
