export interface EnterpriseGridConfig {
  title?: string;
  subtitle?: string;
  enableExport?: boolean;
  enableRefresh?: boolean;
  enableAdd?: boolean;
  enableBulkDelete?: boolean;
  enableSideBar?: boolean;
  enableStatusBar?: boolean;
  height?: string;
  theme?: 'light' | 'dark';
}

export interface GridAction {
  label: string;
  icon: string;
  action: () => void;
  type?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface GridColumn {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  filter?: boolean | string;
  editable?: boolean;
  cellRenderer?: string;
  cellEditor?: string;
  valueFormatter?: (params: any) => string;
  valueGetter?: (params: any) => any;
  pinned?: 'left' | 'right';
  hide?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
}
