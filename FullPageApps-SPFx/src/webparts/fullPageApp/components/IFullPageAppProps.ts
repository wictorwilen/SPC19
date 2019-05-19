import { Launch } from "../../../defs/Launches";
import { DisplayMode } from '@microsoft/sp-core-library';
import { FormFactor } from "../FullPageAppWebPart";

export interface IFullPageAppProps {
  count: number;
  tbd: string;
  success: string;
  model: string;
  title: string;
  displayMode: DisplayMode;
  updateTitle: (value: string) => void;
  compact: boolean;
  narrow: boolean;
  formFactor: FormFactor;
  infiniteScroll: boolean;
  preview: boolean;
}
export interface IFullPageAppState {
  launches: Launch[];
  loading: boolean;
  page: number;
}