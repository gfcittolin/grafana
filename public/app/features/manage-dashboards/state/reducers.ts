import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DashboardDTO } from 'app/types';

export enum DashboardSource {
  Gcom = 0,
  Json = 1,
}

export interface ImportDashboardState {
  meta: { updatedAt: string; orgName: string };
  dashboard: any;
  source: DashboardSource;
  inputs: any[];
  gcomError: string;
  isLoaded: boolean;
  uidExists: boolean;
  uidError: string;
}

const initialImportDashboardState: ImportDashboardState = {
  meta: { updatedAt: '', orgName: '' },
  dashboard: {},
  source: DashboardSource.Json,
  inputs: [],
  gcomError: '',
  isLoaded: false,
  uidExists: false,
  uidError: '',
};

const importDashboardSlice = createSlice({
  name: 'manageDashboards',
  initialState: initialImportDashboardState,
  reducers: {
    setGcomDashboard: (state, action: PayloadAction<any>): ImportDashboardState => {
      return {
        ...state,
        dashboard: action.payload.json,
        meta: { updatedAt: action.payload.updatedAt, orgName: action.payload.orgName },
        source: DashboardSource.Gcom,
        isLoaded: true,
      };
    },
    setJsonDashboard: (state, action: PayloadAction<any>): ImportDashboardState => {
      return {
        ...state,
        dashboard: action.payload,
        source: DashboardSource.Json,
        isLoaded: true,
      };
    },
    clearDashboard: (state): ImportDashboardState => {
      return {
        ...state,
        dashboard: {},
        isLoaded: false,
      };
    },
    dashboardTitleChange: (state, action: PayloadAction<string>): ImportDashboardState => {
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          title: action.payload,
        },
      };
    },
    dashboardUidChange: (state, action: PayloadAction<string>): ImportDashboardState => {
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          uid: action.payload,
        },
        uidExists: false,
      };
    },
    dashboardUidExists: (state, action: PayloadAction<DashboardDTO>): ImportDashboardState => {
      return {
        ...state,
        uidExists: true,
        uidError: `Dashboard named '${action.payload.dashboard.title}' in folder '${action.payload.meta.folderTitle}' has the same uid`,
      };
    },
    setGcomError: (state, action: PayloadAction<string>): ImportDashboardState => ({
      ...state,
      gcomError: action.payload,
    }),
    setInputs: (state, action: PayloadAction<any[]>): ImportDashboardState => ({
      ...state,
      inputs: action.payload,
    }),
  },
});

export const {
  clearDashboard,
  setInputs,
  setGcomDashboard,
  setJsonDashboard,
  setGcomError,
  dashboardTitleChange,
  dashboardUidChange,
  dashboardUidExists,
} = importDashboardSlice.actions;

export const importDashboardReducer = importDashboardSlice.reducer;

export default {
  importDashboard: importDashboardReducer,
};