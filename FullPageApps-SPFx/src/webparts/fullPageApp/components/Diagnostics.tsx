import * as React from 'react';
import { IFullPageAppProps } from './IFullPageAppProps';
import { Customizer, MessageBar, Text, Button, MessageBarButton, Label } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { FormFactor } from '../FullPageAppWebPart';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
export interface IDiagnosticsProps {
    formFactor: FormFactor;
    context: WebPartContext;
}
export default class Diagnostics extends React.Component<IDiagnosticsProps, any> {
    constructor(props: IDiagnosticsProps, state: any) {
        super(props, state);
        this.state = {};
    }

    public componentDidMount() {
    }

    public render(): React.ReactElement<IFullPageAppProps> {
        return (
            <Customizer {...FluentCustomizations}>
                <Label>Diagnostics</Label>
                <MessageBar
                    styles={{
                        root: {
                            background: 'rgba(113, 175, 229, 0.2)',
                            color: '#00188f'
                        },
                        icon: {
                            color: '#00188f'
                        }
                    }}
                    actions={
                        <div>
                            <MessageBarButton onClick={() => { this.getPageLayoutType(); }} >Get Page Layout Type</MessageBarButton>
                            <MessageBarButton onClick={() => { this.switchPageLayoutType(); }}>Switch Page Layout Type</MessageBarButton>
                        </div>
                    }>
                    {(this.props.formFactor == FormFactor.WebPart) &&
                        <Text>Rendered it in a Web Part</Text>}
                    {(this.props.formFactor == FormFactor.FullBleedWebPart) &&
                        <Text>Rendered it in a Full Bleed Web Part</Text>}
                    {(this.props.formFactor == FormFactor.FullPageWebPart) &&
                        <Text>Rendered it in a Full Page Application</Text>}
                    <Label>{this.state.pageLayoutType}</Label>
                </MessageBar>
            </Customizer>
        );
    }

    private getPageLayoutType() {
        const url = `${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists('${this.props.context.pageContext.list.id}')/items(${this.props.context.pageContext.listItem.id})/Properties?$select=PageLayoutType`;
        this.props.context.spHttpClient.get(url, SPHttpClient.configurations.v1).then(response => {
            response.json().then(json => this.setState({
                pageLayoutType: json.PageLayoutType
            }));
        });

    }
    private switchPageLayoutType() {
        if (this.state.pageLayoutType) {
            const url = `${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists('${this.props.context.pageContext.list.id}')/items(${this.props.context.pageContext.listItem.id})`;
            this.props.context.spHttpClient.post(url, SPHttpClient.configurations.v1, {
                headers: {
                    'X-HTTP-Method': 'MERGE',
                    'IF-MATCH': '*',
                    'content-type': 'application/json;odata=nometadata',
                },
                body: JSON.stringify({
                    PageLayoutType: this.state.pageLayoutType == "Article" ?
                        "SingleWebPartAppPage" :
                        "Article"
                })
            }).then(response => {
                if (response.ok) {
                    alert("Done!");
                } else {
                    alert(`An error happened: ${response.statusText}`);
                }
            });
        } else {
            alert("Please get the page layout type first");
        }
    }
}
