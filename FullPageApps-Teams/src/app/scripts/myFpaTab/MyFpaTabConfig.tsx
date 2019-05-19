import * as React from "react";
import {
    PrimaryButton,
    Panel,
    PanelBody,
    PanelHeader,
    PanelFooter,
    Input,
    Surface,
    getContext,
    TeamsThemeContext,
    Dropdown
} from "msteams-ui-components-react";
import TeamsBaseComponent, { ITeamsBaseComponentProps, ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { isNumber } from "util";

export interface IMyFpaTabConfigState extends ITeamsBaseComponentState {
    count: number;
    tbd: string;
    success: string;
    model: string;
}

export interface IMyFpaTabConfigProps extends ITeamsBaseComponentProps {

}

/**
 * Implementation of My FPA configuration page
 */
export class MyFpaTabConfig extends TeamsBaseComponent<IMyFpaTabConfigProps, IMyFpaTabConfigState> {

    public componentWillMount() {
        this.updateTheme(this.getQueryVariable("theme"));
        this.setState({
            fontSize: this.pageFontSize()
        });

        if (this.inTeams()) {
            microsoftTeams.initialize();

            microsoftTeams.getContext((context: microsoftTeams.Context) => {
                this.setState({
                    count: parseInt(this.getParameterByName("count", context.entityId) || "16", 10),
                    tbd: this.getParameterByName("tbd", context.entityId) || "all",
                    success: this.getParameterByName("success", context.entityId) || "all",
                    model: this.getParameterByName("model", context.entityId) || "all",
                });
                this.setValidityState(true);
            });

            microsoftTeams.settings.registerOnSaveHandler((saveEvent: microsoftTeams.settings.SaveEvent) => {
                // Calculate host dynamically to enable local debugging
                const host = "https://" + window.location.host;
                microsoftTeams.settings.setSettings({
                    contentUrl: host + `/myFpaTab/?count=${this.state.count}&model=${this.state.model}&success=${this.state.success}&tbd=${this.state.tbd}`,
                    suggestedDisplayName: "SpaceX Launches",
                    removeUrl: host + "/myFpaTab/remove.html",
                    entityId: "some-id",
                });
                saveEvent.notifySuccess();
            });
        } else {
        }
    }

    public render() {
        const context = getContext({
            baseFontSize: this.state.fontSize,
            style: this.state.theme
        });
        const { rem, font } = context;
        const { sizes, weights } = font;
        const styles = {
            header: { ...sizes.title, ...weights.semibold },
            section: { ...sizes.base, marginTop: rem(1.4), marginBottom: rem(1.4) },
            footer: { ...sizes.xsmall }
        };
        return (
            <TeamsThemeContext.Provider value={context}>
                <Surface>
                    <Panel>
                        <PanelHeader>
                            <div style={styles.header}>What data do you want to show?</div>
                        </PanelHeader>
                        <PanelBody>
                            <div style={styles.section}>
                                <Input
                                    autoFocus
                                    placeholder="16"
                                    label="Number of launches to show"
                                    errorLabel={!this.state.count ? "This value is required" : (!isNumber(this.state.count) ? "Must be a numeric value" : undefined)}
                                    value={this.state.count}
                                    onChange={(e) => {
                                        this.setState({
                                            count: parseInt(e.target.value, 10)
                                        }, () => {
                                            this.setValidityState(true);
                                        });
                                    }}
                                    required />
                                <Dropdown
                                    autoFocus
                                    style={{ width: "100%" }}
                                    label="Rocket model"
                                    mainButtonText={this.state.model}
                                    items={[{
                                        text: "All",
                                        onClick: () => { this.setState({ model: "all" }); }
                                    },
                                    {
                                        text: "Falcon 1",
                                        onClick: () => { this.setState({ model: "falcon1" }); }
                                    },
                                    {
                                        text: "Falcon 9",
                                        onClick: () => { this.setState({ model: "falcon9" }); }
                                    },
                                    {
                                        text: "Falcon Heavy",
                                        onClick: () => { this.setState({ model: "falconheavy" }); }
                                    }]}
                                />
                                <Dropdown
                                    autoFocus
                                    style={{ width: "100%" }}
                                    label="Launch status"
                                    mainButtonText={this.state.tbd}
                                    items={[{
                                        text: "All",
                                        onClick: () => { this.setState({ tbd: "all" }); }
                                    },
                                    {
                                        text: "Complete",
                                        onClick: () => { this.setState({ tbd: "complete" }); }
                                    },
                                    {
                                        text: "Planned",
                                        onClick: () => { this.setState({ tbd: "planned" }); }
                                    }]}
                                />
                                <Dropdown
                                    autoFocus
                                    style={{ width: "100%" }}
                                    label="Launch results"
                                    mainButtonText={this.state.success}
                                    items={[{
                                        text: "All",
                                        onClick: () => { this.setState({ success: "all" }); }
                                    },
                                    {
                                        text: "Successful",
                                        onClick: () => { this.setState({ success: "successful" }); }
                                    },
                                    {
                                        text: "Failed",
                                        onClick: () => { this.setState({ success: "failed" }); }
                                    }]}
                                />

                            </div>

                        </PanelBody>
                        <PanelFooter>
                        </PanelFooter>
                    </Panel>
                </Surface>
            </TeamsThemeContext.Provider>
        );
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
