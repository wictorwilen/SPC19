

import { connectTeamsComponent, ITeamsThemeContextProps, Panel } from "msteams-ui-components-react";
import { MSTeamsIconType, MSTeamsIconWeight } from "msteams-ui-icons-react";
import * as React from "react";
import * as styles from "./styles";
import { Launch } from "../../../defs/Launches";


interface ILaunchCardProps extends Launch {
}
type Props = ILaunchCardProps & ITeamsThemeContextProps;

interface IComponentState {
}

class LaunchCardDef extends React.Component<Props, IComponentState> {
    public render() {
        const { context } = this.props;
        const classes = styles.appCard(context);

        return (

            <Panel className={classes.panel}>
                <div
                    onMouseDown={(e) => e.preventDefault()}
                    className={classes.card}
                >
                    <img
                        className={classes.header.icon}
                        src={this.props.links.mission_patch} />
                    <div className={classes.header.text.container}>
                        <div className={classes.header.text.primary}>{this.props.mission_name}</div>
                        <div className={classes.header.text.secondary}>{this.props.details}</div>
                    </div>
                </div>
            </Panel >
        );
    }

}

export const LaunchCard = connectTeamsComponent(LaunchCardDef);

