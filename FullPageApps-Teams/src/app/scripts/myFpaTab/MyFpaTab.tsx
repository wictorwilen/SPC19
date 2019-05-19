import * as React from "react";
import {
    PrimaryButton,
    TeamsThemeContext,
    Panel,
    PanelBody,
    PanelHeader,
    PanelFooter,
    Surface,
    getContext,
    ThemeStyle
} from "msteams-ui-components-react";
import TeamsBaseComponent, { ITeamsBaseComponentProps, ITeamsBaseComponentState } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import { Launch } from "../../defs/Launches";
import { LaunchCard } from "./components/LaunchCard";
import * as styles from "./styles";
/**
 * State for the myFpaTabTab React component
 */
export default interface IMyFpaTabState extends ITeamsBaseComponentState {
    entityId?: string;
    launches: Launch[];
    loading: boolean;
    count: number;
    tbd: string;
    success: string;
    model: string;
}

/**
 * Properties for the myFpaTabTab React component
 */
export interface IMyFpaTabProps extends ITeamsBaseComponentProps {
}

/**
 * Implementation of the My FPA content page
 */
export class MyFpaTab extends TeamsBaseComponent<IMyFpaTabProps, IMyFpaTabState> {
    constructor(props: IMyFpaTabProps, state: IMyFpaTabState) {
        super(props, state);
        this.state = {
            launches: [],
            loading: true,
            fontSize: 16,
            theme: ThemeStyle.Light,
            count: 16,
            tbd: "all",
            success: "all",
            model: "all"
        };
    }
    public componentWillMount() {
        this.updateTheme(this.getQueryVariable("theme"));
        this.setState({
            fontSize: this.pageFontSize()
        });

        if (this.inTeams()) {
            microsoftTeams.initialize();
            microsoftTeams.registerOnThemeChangeHandler(this.updateTheme);
            microsoftTeams.getContext((context) => {
                this.setState({
                    count: parseInt(this.getParameterByName("count", context.entityId) || "16", 10),
                    tbd: this.getParameterByName("tbd", context.entityId) || "all",
                    success: this.getParameterByName("success", context.entityId) || "all",
                    model: this.getParameterByName("model", context.entityId) || "all",
                });
                this.loadData();
            });
        } else {
            this.setState({
                entityId: "This is not hosted in Microsoft Teams"
            });
        }
    }


    /**
     * The render() method to create the UI of the tab
     */
    public render() {
        const context = getContext({
            baseFontSize: this.state.fontSize,
            style: this.state.theme
        });
        const { rem, font } = context;
        const { sizes, weights } = font;
        const localStyles = {
            header: { ...sizes.title, ...weights.semibold },
            section: { ...sizes.base, marginTop: rem(1.4), marginBottom: rem(1.4) },
            footer: { ...sizes.xsmall }
        };
        const classes = styles.mainStyles(context);

        return (
            <TeamsThemeContext.Provider value={context}>
                <Surface>
                    <Panel>
                        <PanelHeader>
                            <div style={localStyles.header}>SpaceX Launches</div>
                        </PanelHeader>
                        <PanelBody>
                            {this.state.loading && <div>Loading SpaceX launches...</div>}
                            <div className={classes.grid}>
                                {this.state.launches.map((launch: Launch) => {
                                    return (<LaunchCard
                                        {...launch}
                                    />);
                                })}
                                {(this.state.launches.length === 0 && !this.state.loading) &&
                                    <div className={classes.heading}>No launches found with this filter</div>
                                }
                            </div>
                        </PanelBody>
                        <PanelFooter>
                            <div style={localStyles.footer}>
                                (C) Copyright Wictor Wilen 2019
                            </div>
                        </PanelFooter>
                    </Panel>
                </Surface>
            </TeamsThemeContext.Provider>
        );
    }

    private loadData() {
        this.setState({
            loading: true
        });
        let url = `https://api.spacexdata.com/v3/launches?limit=${this.state.count}`;
        switch (this.state.success) {
            case "successful":
                url += `&launch_success=true`;
                break;
            case "failed":
                url += `&launch_success=false`;
                break;
        }
        switch (this.state.tbd) {
            case "planned":
                url += `&tbd=true`;
                break;
            case "complete":
                url += `&tbd=false`;
                break;
        }
        if (this.state.model !== "all" && this.state.model !== undefined) {
            url += `&rocket_id=${this.state.model}`;
        }
        fetch(url).then(r => r.json().then((data: Launch[]) => {
            this.setState({
                launches: data,
                loading: false
            });
        }));
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
