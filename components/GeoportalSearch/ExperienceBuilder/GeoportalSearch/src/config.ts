import { ImmutableObject } from 'seamless-immutable';

export interface Config {
  exampleConfigProperty: string;
  urlTooltip: string;
  typeTooltip: string;
  profileTooltip: string;
  filterTooltip: string;
  targets: Array<Target>;
  widgetTitle: string;
}

export interface Target {
  name: string;
  url: string;
  type: string;
  profile: string;
  requiredFilter: string;
  enabled: boolean;
  useProxy: boolean;
  disableContentType: boolean;
}

export type IMConfig = ImmutableObject<Config>;
