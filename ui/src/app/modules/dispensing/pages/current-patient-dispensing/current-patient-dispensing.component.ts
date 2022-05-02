import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DrugOrder } from 'src/app/shared/resources/order/models/drug-order.model';
import {
  ActionButtonStyle,
  TableActionOption,
} from 'src/app/shared/models/table-action-options.model';
import { TableColumn } from 'src/app/shared/models/table-column.model';
import { TableSelectAction } from 'src/app/shared/models/table-select-action.model';
import { DrugOrdersService } from 'src/app/shared/resources/order/services';
import { Visit } from 'src/app/shared/resources/visits/models/visit.model';
import { VisitsService } from 'src/app/shared/resources/visits/services';
import { DispensingFormComponent } from '../../../../shared/dialogs/dispension-form/dispension-form.component';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/store/reducers';
import { getCurrentLocation } from 'src/app/store/selectors';
import { loadActiveVisit } from 'src/app/store/actions/visit.actions';
import { Patient } from 'src/app/shared/resources/patient/models/patient.model';
import { getCurrentPatient } from 'src/app/store/selectors/current-patient.selectors';
import {
  go,
  loadCurrentPatient,
  removeCurrentPatient,
} from 'src/app/store/actions';
import {
  getVisitLoadedState,
  getVisitLoadingState,
} from 'src/app/store/selectors/visit.selectors';
import { SystemSettingsService } from 'src/app/core/services/system-settings.service';

@Component({
  selector: 'app-current-patient-dispensing',
  templateUrl: './current-patient-dispensing.component.html',
  styleUrls: ['./current-patient-dispensing.component.scss'],
})
export class CurrentPatientDispensingComponent implements OnInit {
  loading: boolean;
  loadingError: string;
  patientVisit$: Observable<Visit>;
  drugOrderColumns: TableColumn[];
  dispensingActionOptions: TableActionOption[];
  currentLocation$: Observable<any>;
  patientId: string;
  response$: Observable<any>;
  currentPatient$: Observable<Patient>;
  currentVisitLoadingState$: Observable<boolean>;
  currentVisitLoadedState$: Observable<boolean>;
  generalMetadataConfigurations$: Observable<any>;
  constructor(
    private route: ActivatedRoute,
    private systemSettingsService: SystemSettingsService,
    private dialog: MatDialog,
    private visitService: VisitsService,
    private store: Store<AppState>,
    private drugOrderService: DrugOrdersService
  ) {}

  ngOnInit() {
    this.patientId = this.route?.snapshot?.params?.id;
    this.store.dispatch(removeCurrentPatient());
    this.store.dispatch(loadCurrentPatient({ uuid: this.patientId }));
    this.currentVisitLoadingState$ = this.store.select(getVisitLoadingState);
    this.currentVisitLoadedState$ = this.store.select(getVisitLoadedState);
    this.currentLocation$ = this.store.pipe(select(getCurrentLocation));
    this.currentPatient$ = this.store.select(getCurrentPatient);
    this.generalMetadataConfigurations$ = this.systemSettingsService.getSystemSettingsByKey('iCare.GeneralMetadata.Configurations')

    this.dispensingActionOptions = [
      {
        id: 'calculate_prescription',
        actionCode: 'CALCULATE_PRESCRIPTION',
        name: 'Calculate',
        buttonStyle: new ActionButtonStyle({ shape: 'OUTLINE' }),
      },
      {
        id: 'dispense_prescription',
        actionCode: 'DISPENSE_PRESCRIPTION',
        name: 'Dispense',
        buttonStyle: new ActionButtonStyle({ shape: 'FLAT', color: 'primary' }),
      },
    ];

    this.getPatientVisit();
  }

  private getPatientVisit() {
    this.loading = true;

    this.patientVisit$ = this.visitService
      .getActiveVisit(this.patientId, false)
      .pipe(
        tap(() => {
          this.loading = false;
        }),
        catchError((error) => {
          this.loading = false;
          this.loadingError = error;
          return of(null);
        })
      );
  }

  onBack(e: MouseEvent) {
    e.stopPropagation();
    this.store.dispatch(go({ path: ['/dispensing'] }));
  }

  onSelectAction(
    tableSelectAction: TableSelectAction,
    patientVisit: Visit,
    location: any
  ) {
    if (tableSelectAction) {
      const { actionOption, data } = tableSelectAction;
      switch (actionOption?.actionCode) {
        case 'CALCULATE_PRESCRIPTION':
          const dialog = this.dialog.open(DispensingFormComponent, {
            width: '80%',
            disableClose: true,
            data: {
              drugOrder: (data as DrugOrder).toJson(),
              patient: patientVisit.patient,
              visit: patientVisit,
              location,
              fromDispensing: true,
              showAddButton: false,
            },
          });

          dialog.afterClosed().subscribe((response) => {
            if (response) {
              switch (response.action) {
                case 'ORDER_SAVED':
                  // TODO: Add support to show success notification
                  this.getPatientVisit();
                  break;
                default:
                  break;
              }
            }
          });
          break;
        case 'DISPENSE_PRESCRIPTION':
          const drugOrderDispenseDetails = {
            uuid: data['uuid'],
            location: JSON.parse(localStorage.getItem('currentLocation'))[
              'uuid'
            ],
          };
          this.response$ = this.drugOrderService.dispenseOrderedDrugOrder(
            drugOrderDispenseDetails
          );

          this.store.dispatch(
            loadActiveVisit({
              patientId: patientVisit.patient['uuid'],
            })
          );

          break;
        default:
          break;
      }
    }
  }
}