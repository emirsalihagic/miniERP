import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent, SelectionChangedEvent, CellClickedEvent } from 'ag-grid-community';
import { EnterpriseGridConfig } from '../../interfaces/enterprise-grid.interface';

@Component({
  selector: 'app-enterprise-grid',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  template: `
    <div class="enterprise-grid-container">
      <!-- Grid Toolbar -->
      <div class="grid-toolbar" *ngIf="showToolbar">
        <div class="toolbar-left">
          <h3 class="grid-title">{{ config.title || 'Data Grid' }}</h3>
          <p class="grid-subtitle" *ngIf="config.subtitle">{{ config.subtitle }}</p>
        </div>
        <div class="toolbar-right">
          <div class="toolbar-actions">
            <button 
              class="btn btn-outline" 
              (click)="exportData()"
              *ngIf="config.enableExport"
              title="Export Data"
            >
              <span nz-icon nzType="download"></span>
              Export
            </button>
            <button 
              class="btn btn-outline" 
              (click)="refreshData()"
              *ngIf="config.enableRefresh"
              title="Refresh Data"
            >
              <span nz-icon nzType="reload"></span>
              Refresh
            </button>
            <button 
              class="btn btn-primary" 
              (click)="addNew()"
              *ngIf="config.enableAdd"
              title="Add New"
            >
              <span nz-icon nzType="plus"></span>
              Add New
            </button>
          </div>
          <div class="bulk-actions" *ngIf="selectedRows.length > 0">
            <span class="selected-count">{{ selectedRows.length }} selected</span>
            <button class="btn btn-sm btn-danger" (click)="bulkDelete()" title="Delete Selected">
              <span nz-icon nzType="delete"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- AG-Grid -->
      <div class="ag-theme-alpine-dark enterprise-grid" [class.ag-theme-alpine]="!isDarkMode">
        <ag-grid-angular
          [rowData]="rowData"
          [columnDefs]="columnDefs"
          [gridOptions]="gridOptions"
          [class]="gridClass"
          (gridReady)="onGridReady($event)"
          (selectionChanged)="onSelectionChanged($event)"
          (cellClicked)="onCellClicked($event)"
        ></ag-grid-angular>
      </div>

      <!-- Grid Footer -->
      <div class="grid-footer" *ngIf="showFooter">
        <div class="footer-info">
          <span class="results-count">{{ totalRows }} rows</span>
          <span *ngIf="selectedRows.length > 0">{{ selectedRows.length }} selected</span>
        </div>
        <div class="footer-actions">
          <button class="btn btn-outline" (click)="refreshData()">
            <span nz-icon nzType="reload"></span>
            Refresh
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .enterprise-grid-container {
      background: var(--color-bg-container);
      border-radius: var(--radius-base);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .grid-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--color-bg-base);
      border-bottom: 1px solid var(--color-border);
      
      .toolbar-left {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .grid-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-base);
          margin: 0;
        }
        
        .grid-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
        }
      }
      
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .toolbar-actions {
          display: flex;
          gap: 8px;
        }
        
        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(59, 130, 246, 0.2);
          
          .selected-count {
            font-size: 12px;
            color: var(--color-primary);
            font-weight: 500;
          }
        }
      }
    }

    .enterprise-grid {
      height: 500px;
      width: 100%;
    }

    .grid-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--color-bg-base);
      border-top: 1px solid var(--color-border);
      
      .footer-info {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 14px;
        color: var(--color-text-secondary);
        
        .results-count {
          font-weight: 500;
          color: var(--color-text-base);
        }
      }
      
      .footer-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }

    /* AG-Grid Theme Customization */
    :host ::ng-deep {
      .ag-theme-alpine,
      .ag-theme-alpine-dark {
        --ag-background-color: var(--color-bg-container);
        --ag-foreground-color: var(--color-text-base);
        --ag-border-color: var(--color-border);
        --ag-header-background-color: var(--color-bg-base);
        --ag-header-foreground-color: var(--color-text-base);
        --ag-odd-row-background-color: var(--color-bg-container);
        --ag-row-hover-color: rgba(59, 130, 246, 0.05);
        --ag-selected-row-background-color: rgba(59, 130, 246, 0.1);
        --ag-range-selection-background-color: rgba(59, 130, 246, 0.1);
        --ag-input-border-color: var(--color-border);
        --ag-input-focus-border-color: var(--color-primary);
        --ag-font-size: 14px;
        --ag-font-family: inherit;
      }
      
      .ag-header-cell {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 13px;
      }
      
      .ag-cell {
        border-right: 1px solid var(--color-border);
        padding: 12px 16px;
      }
      
      .ag-row {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .ag-row:hover {
        background: rgba(59, 130, 246, 0.03);
      }
      
      .ag-row-selected {
        background: rgba(59, 130, 246, 0.1);
      }
    }
  `]
})
export class EnterpriseGridComponent implements OnInit, OnDestroy {
  @Input() config: EnterpriseGridConfig = {};
  @Input() rowData: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() showToolbar: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() isDarkMode: boolean = false;

  @Output() gridReady = new EventEmitter<GridReadyEvent>();
  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() addNew = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() bulkDelete = new EventEmitter<any[]>();

  selectedRows: any[] = [];
  totalRows: number = 0;
  gridClass: string = 'ag-theme-alpine';

  gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100
    },
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    animateRows: true,
    enableRangeSelection: true,
    enableCharts: true,
    sideBar: {
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'Columns',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel'
        },
        {
          id: 'filters',
          labelDefault: 'Filters',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel'
        }
      ],
      defaultToolPanel: 'columns'
    },
    statusBar: {
      statusPanels: [
        { statusPanel: 'agTotalAndFilteredRowCountComponent' },
        { statusPanel: 'agTotalRowCountComponent' },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' }
      ]
    }
  };

  ngOnInit() {
    this.updateGridClass();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  updateGridClass() {
    this.gridClass = this.isDarkMode ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
  }

  onGridReady(event: GridReadyEvent) {
    this.totalRows = event.api.getDisplayedRowCount();
    this.gridReady.emit(event);
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = event.api.getSelectedRows();
    this.selectionChanged.emit(this.selectedRows);
  }

  onCellClicked(event: CellClickedEvent) {
    this.cellClicked.emit(event);
  }

  refreshData() {
    this.refresh.emit();
  }

  addNew() {
    this.addNew.emit();
  }

  exportData() {
    this.export.emit();
  }

  bulkDelete() {
    this.bulkDelete.emit(this.selectedRows);
  }
}
