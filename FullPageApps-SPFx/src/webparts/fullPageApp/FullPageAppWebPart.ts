import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart, PropertyPaneSlider, PropertyPaneToggle } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneChoiceGroup
} from '@microsoft/sp-property-pane';

import * as strings from 'FullPageAppWebPartStrings';
import FullPageApp from './components/FullPageApp';
import { IFullPageAppProps } from './components/IFullPageAppProps';
import Diagnostics, { IDiagnosticsProps } from "./components/Diagnostics";
export interface IFullPageAppWebPartProps {
  count: number;
  tbd: string;
  success: string;
  model: string;
  title: string;
  compact: boolean;
  narrow: boolean;
  diagnostics: boolean;
  infiniteScroll: boolean;
}

export enum FormFactor {
  WebPart,
  FullBleedWebPart,
  FullPageWebPart
}

export default class FullPageAppWebPart extends BaseClientSideWebPart<IFullPageAppWebPartProps> {
  protected domElementMain: HTMLElement;
  protected domElementDiag: HTMLElement;

  /**
   * Three options
   * 1) Use pure CSS - See Stefan Bauers blog: https://n8d.at/blog/major-css-class-changes-in-communication-site-and-workbench/
   * 2) Use DOM
   * 3) Use the unsupported/undocumented `formFactor`
   */
  private getHost(): FormFactor {
    if (false) {
      // method 2)
      if (this.domElement.parentElement.className.indexOf("mainContent") >= 0) {
        console.log("Full Page Web Part");
        return FormFactor.FullPageWebPart;
      }
      const dragDisallowedAreaTag = this.context.domElement.parentElement.parentElement.parentElement.parentElement.parentElement.dataset["dragDisallowedAreaTag"];
      if (dragDisallowedAreaTag == "CanvasFullWidth") {
        console.log("Full Bleed Web Part");
        return FormFactor.FullBleedWebPart;
      } else {
        console.log("Normal Web Part");
        return FormFactor.WebPart;
      }
    } else {
      // method 3)
      const factor: number = (this.context as any).formFactor;
      if (factor == 1) {
        console.log("Full Page Web Part");
        return FormFactor.FullPageWebPart;
      }
      const dragDisallowedAreaTag = this.context.domElement.parentElement.parentElement.parentElement.parentElement.parentElement.dataset["dragDisallowedAreaTag"];
      if (dragDisallowedAreaTag == "CanvasFullWidth") {
        console.log("Full Bleed Web Part");
        return FormFactor.FullBleedWebPart;
      } else {
        console.log("Normal Web Part");
        return FormFactor.WebPart;
      }
    }
  }

  /**
   * Returns true if the page is in preview mode
   */
  public isInPreviewMode(): boolean {
    return this.getParameterByName("Mode", this.context.domElement.ownerDocument && this.context.domElement.ownerDocument.location.href) === "Preview";
  }
  
  public render(): void {
    if (!this.renderedOnce) {
      this.domElement.innerHTML = `<div></div><div></div>`;
      this.domElementMain = this.domElement.childNodes.item(0) as HTMLElement;
      this.domElementDiag = this.domElement.childNodes.item(1) as HTMLElement;
    }
    const formFactor = this.getHost();
    const element: React.ReactElement<IFullPageAppProps> = React.createElement(
      FullPageApp,
      {
        count: this.properties.count,
        tbd: this.properties.tbd,
        success: this.properties.success,
        model: this.properties.model,
        title: this.properties.title,
        displayMode: this.displayMode,
        updateTitle: (value: string) => {
          this.properties.title = value;
        },
        compact: formFactor == FormFactor.FullPageWebPart ? false : this.properties.compact,
        narrow: FormFactor.FullPageWebPart ? false : this.properties.narrow,
        formFactor: formFactor,
        infiniteScroll: this.properties.infiniteScroll,
        preview: this.isInPreviewMode()
      }
    );
    ReactDom.render(element, this.domElementMain);
    console.log(this.context);


    if (this.properties.diagnostics) {
      const diagElement: React.ReactElement<IDiagnosticsProps> = React.createElement(
        Diagnostics,
        {
          formFactor: formFactor,
          context: this.context
        });
      ReactDom.render(diagElement, this.domElementDiag);
    }
  }



  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const formFactor = this.getHost();
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "Display",
              groupFields: [
                PropertyPaneToggle("infiniteScroll", {
                  label: "Infinite scroll",
                  disabled: formFactor != FormFactor.FullPageWebPart
                }),
                PropertyPaneToggle("compact", {
                  label: "Compact view",
                  disabled: formFactor == FormFactor.FullPageWebPart
                }),
                PropertyPaneToggle("narrow", {
                  label: "Narrow design",
                  disabled: formFactor == FormFactor.FullPageWebPart
                }),
                PropertyPaneToggle("diagnostics", {
                  label: "Diagnostics",
                }),
              ]
            },
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneSlider('count', {
                  label: "Number of launches to show",
                  min: 1,
                  max: 200
                }),
                PropertyPaneChoiceGroup('model', {
                  label: "Rocket model",
                  options: [
                    { text: "All models", key: "all" },
                    { text: "Falcon 1", key: "falcon1" },
                    { text: "Falcon 9", key: "falcon9" },
                    { text: "Falcon Heavy", key: "falconheavy" },
                  ]
                }),
                PropertyPaneChoiceGroup('tbd', {
                  label: "Launch status",
                  options: [
                    { text: "All launches", key: "all" },
                    { text: "Complete launches", key: "complete" },
                    { text: "Planned launches", key: "planned" },
                  ]
                }),
                PropertyPaneChoiceGroup('success', {
                  label: "Launch results",
                  options: [
                    { text: "All", key: "all" },
                    { text: "Successful launches", key: "successful" },
                    { text: "Failed launches", key: "failed" },
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private getParameterByName(name: string, url: string): string | undefined {
    if (!url) { url = window.location.href; }
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) { return undefined; }
    if (!results[2]) { return ""; }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
}
