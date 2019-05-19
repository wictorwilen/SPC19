import * as React from 'react';
import styles from './FullPageApp.module.scss';
import cardStyles from "../../../controls/LaunchCard.module.scss";
import { IFullPageAppProps, IFullPageAppState } from './IFullPageAppProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { Launch } from '../../../defs/Launches';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { LaunchCard } from '../../../controls/LaunchCard';
import { Customizer, css, Stack, Text, MessageBar } from 'office-ui-fabric-react';
import { FluentCustomizations } from '@uifabric/fluent-theme';
import { WebPartTitle } from "@pnp/spfx-controls-react/lib/WebPartTitle";
import { FormFactor } from '../FullPageAppWebPart';
import { Card } from '@uifabric/react-cards';

export default class FullPageApp extends React.Component<IFullPageAppProps, IFullPageAppState> {
  constructor(props: IFullPageAppProps, state: IFullPageAppState) {
    super(props, state);
    this.state = {
      launches: [],
      loading: true,
      page: 0
    };
  }

  public componentDidMount() {
    if (this.props.formFactor == FormFactor.FullPageWebPart && this.props.infiniteScroll) {
      window.addEventListener('scroll', this.onScroll, false);
    }
    this.loadData(this.props);
  }
  public componentWillUnmount() {
    if (this.props.formFactor == FormFactor.FullPageWebPart && this.props.infiniteScroll) {
      window.removeEventListener('scroll', this.onScroll, false);
    }
  }

  private onScroll = () => {
    if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) && this.state.launches.length) {
      if (!this.state.loading) {
        this.setState({
          page: this.state.page + 1
        }, () => {
          this.loadData(this.props);
        });
      }
    }
  }

  private loadData(props: IFullPageAppProps) {
    this.setState({
      loading: true
    });
    const offset = this.state.page * 12;
    let url = `https://api.spacexdata.com/v3/launches?limit=${props.count}&offset=${offset}`;
    switch (props.success) {
      case "successful":
        url += `&launch_success=true`;
        break;
      case "failed":
        url += `&launch_success=false`;
        break;
    }
    switch (props.tbd) {
      case "planned":
        url += `&tbd=true`;
        break;
      case "complete":
        url += `&tbd=false`;
        break;
    }
    if (props.model !== "all" && props.model !== undefined) {
      url += `&rocket_id=${props.model}`;
    }
    fetch(url).then(r => r.json().then((data: Launch[]) => {
      if (this.state.page == 0) {
        this.setState({
          launches: data,
          loading: false
        });
      } else {
        this.setState({
          launches: this.state.launches.concat(data),
          loading: false
        });
      }

    }));
  }

  public componentWillReceiveProps(nextProps: IFullPageAppProps) {
    if (this.props.count != nextProps.count ||
      this.props.model != nextProps.model ||
      this.props.tbd != nextProps.tbd ||
      this.props.success != nextProps.success) {
      this.loadData(nextProps);
    }
  }

  public render(): React.ReactElement<IFullPageAppProps> {
    return (
      <Customizer {...FluentCustomizations}>
        {this.props.preview &&
          <MessageBar>
            This Web Part is rendered in preview mode
          </MessageBar>
        }
        <WebPartTitle displayMode={this.props.displayMode}
          title={this.props.title}
          updateProperty={this.props.updateTitle} />

        <div className={styles.launches}>

          <div className={styles.grid}>
            {this.state.launches.map((launch: Launch) => {
              return (<LaunchCard
                {...launch}
                compact={this.props.compact}
                narrow={this.props.narrow}
                showDetails={this.props.formFactor == FormFactor.FullPageWebPart} />);
            })}

            {this.state.loading &&
              <Card className={css(cardStyles.launch, this.props.narrow && cardStyles.narrow, this.props.compact && cardStyles.compact)} compact={this.props.compact}>
                <Card.Item align={'start'} grow={2}>
                  <Stack >
                    <Spinner label="Loading SpaceX launches..." />
                  </Stack>
                </Card.Item>
              </Card>
            }

            {(this.state.launches.length == 0 && !this.state.loading) &&

              <Card className={css(cardStyles.launch, this.props.narrow && cardStyles.narrow, this.props.compact && cardStyles.compact)} compact={this.props.compact}>
                <Card.Item align={'start'} grow={2}>
                  <Stack >
                    <Text variant="xLarge" block={true} nowrap={true} >No launches found with this filter</Text>
                  </Stack>
                </Card.Item>
              </Card>
            }
          </div>
        </div>
      </Customizer>
    );
  }

}
