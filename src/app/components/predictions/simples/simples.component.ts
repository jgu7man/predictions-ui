import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PredictionsService } from '../../../services/predictions.service';
import { Loading } from '../../../services/loading/loading.service';
import { InverseRegForm, RegressionForm, RegressionResults } from 'src/app/models/predictions.model';
import { AlertService } from 'src/app/services/alerts/alert.service';

@Component({
  selector: 'app-simples',
  templateUrl: './simples.component.html',
  styleUrls: ['./simples.component.scss']
})
export class SimplesComponent implements OnInit {

  @Input() tableId: string
    @Input() productId: string

  monthform: FormGroup;
  cantform: FormGroup;
    months = new FormControl( 1, [ Validators.required, Validators.min(1), Validators.max(12)])
    cant = new FormControl( 0, [ Validators.required  ] )
  
  results: RegressionResults = {
    predicted_cant: 0,
    months_cant: 0
  }

  constructor (
    public _formBuilder: FormBuilder,
    private _predictions: PredictionsService,
    private _loading: Loading,
    private _alert: AlertService
    ) {
        this.monthform = _formBuilder.group( {
            'months': this.cant,
        })
        this.cantform = _formBuilder.group( {
            'cant': this.cant,
        })
  }

  ngOnInit(): void {
  }

  getCantError() {
    if (this.cant.hasError('required')) {
      return 'Este valor es necesario';
    }
  }

  getMonthsError() {
    if (this.months.hasError('required')) {
      return 'Este valor es necesario';
    }

    if ( this.months.hasError( 'min' ) ) {
        return 'El valor mínimo debe ser 1'
    } else if ( this.months.hasError( 'max' ) ) {
        return ' El valor máximo debe ser 12'
    }
  }


  makeRegression() {
    var request: RegressionForm = {
      table: this.tableId, 
      product: this.productId, 
      months: this.months.value
    }

    this._loading.toggleWaitingSpinner(true)
    this._predictions.cantSalesProjection( request )
      .subscribe( result => {
        this._loading.toggleWaitingSpinner(false)
        this.results.predicted_cant = result.predicted_cant
        this.months.markAsPristine()
      }, error => {
          this._loading.toggleWaitingSpinner( false )
          this._alert.sendError( 'Error en el servidor', error.message )
          console.error(error.error)
    })
  }

  makeInverseReg() {
    var request: InverseRegForm = {
      table: this.tableId, 
      product: this.productId, 
      cant: this.cant.value
    }

    this._loading.toggleWaitingSpinner(true)
    this._predictions.projectionByStats( request )
      .subscribe( result => {
        this._loading.toggleWaitingSpinner(false)
        this.results.months_cant = result.months_cant
        this.cant.markAsPristine()
    }, error => {
      this._loading.toggleWaitingSpinner( false )
      this._alert.sendError( 'Error en el servidor', error.message )
      console.error(error.error)
    })
  }

}
