import { Component, OnInit, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { go } from "src/app/store/actions";
import { AppState } from "src/app/store/reducers";
import { ItemPriceService } from "../../services/item-price.service";

@Component({
  selector: "app-maintenance-home",
  templateUrl: "./maintenance-home.component.html",
  styleUrls: ["./maintenance-home.component.scss"],
})
export class MaintenanceHomeComponent implements OnInit {
  pages: any[];
  currentMenuDepartments$: Observable<any[]>;
  constructor(
    private store: Store<AppState>,
    private itemPriceService: ItemPriceService
  ) {}

  ngOnInit(): void {
    this.pages = [
      {
        id: "price-list",
        name: "Price List",
        searchCode: "PRICE_LIST",
        children: [{ id: "dept-1" }],
      },
      { id: "users", name: "User Management" },
      { id: "drug", name: "Drug Management" },
      { id: "location", name: "Location Management" },
    ];

    this.getDepartmentsForTheCurrentMenu(this.pages[0]);
  }

  getDepartmentsForTheCurrentMenu(currentMenu: any): void {
    if (currentMenu && currentMenu?.searchCode) {
      this.currentMenuDepartments$ =
        this.itemPriceService.getDepartmentsByMappingSearchQuery(
          currentMenu?.searchCode
        );
    } else {
      this.currentMenuDepartments$ = of(null);
    }
  }

  setRoute(event: Event, id: string): void {
    event.stopPropagation();
    this.store.dispatch(
      go({
        path: ["maintenance/" + id],
      })
    );
  }
}