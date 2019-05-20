import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import { Launch } from '../defs/Launches';
import { Card } from '@uifabric/react-cards';
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import styles from './LaunchCard.module.scss';
import { ActivityItem, css, Label } from 'office-ui-fabric-react';
import * as moment from "moment";
import Slider from "react-slick";


export interface ILaunchProps extends Launch {
  compact: boolean;
  narrow: boolean;
  showDetails: boolean;
}

export class LaunchCard extends React.Component<ILaunchProps, {}> {
  public render(): React.ReactElement<ILaunchProps> {

    const icons = {
      Satellite: <Icon iconName={'Refresh'} />,
      "Dragon 1.0": <Icon iconName={'Sprint'} />,
      "Dragon 1.1": <Icon iconName={'Sprint'} />,
      "Crew Dragon": <Icon iconName={'People'} />,
      "Lander": <Icon iconName={'Parachute'} />,
      "Rocket": <Icon iconName={'Rocket'} />,
      "Success": <Icon iconName={'Heart'} />,
      "Failure": <Icon iconName={'HeartBroken'} />,
    };

    const carouselSettings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true
    };
    const aiProps = {
      isCompact: true,
      style: { color: 'inherit' }
    };
    const imgWidth = this.props.narrow ? "80px" : "120px";
    // TODO: make aware of that is is running as a FPA
    return (
      <Card className={css(styles.launch, this.props.narrow && styles.narrow, this.props.compact && styles.compact)} compact={this.props.compact}>
        <Card.Item className={styles.patch} >
          {(this.props.compact == false) &&
            <Slider {...carouselSettings}>
              {this.props.links.mission_patch &&
                <Image src={this.props.links.mission_patch} imageFit={ImageFit.centerCover} height={imgWidth} alt="Mission Patch" />
              }
              {this.props.links.flickr_images.map((flimg, idx) => {
                let img = flimg.replace("_o.jpg", "_z.jpg"); // use a smaller Flickr image format: https://www.flickr.com/services/api/misc.urls.html
                return <Image src={img} imageFit={ImageFit.centerCover} height={imgWidth} key={`flimg-${idx}`} />;
              })}
            </Slider>
          }
          {(this.props.compact == true && this.props.links.mission_patch_small) &&
            <Image src={this.props.links.mission_patch_small} height={imgWidth} alt="Mission Patch" />
          }
        </Card.Item>
        <Card.Item align={'start'} grow={2}>
          <Stack >
            <Text variant="medium">{this.props.rocket.rocket_name}</Text>
            <Text variant="xLarge" block={true} nowrap={true} >{this.props.mission_name} </Text>
            {!this.props.compact &&
              <Text variant="small" >{this.props.details}</Text>
            }
          </Stack>
        </Card.Item>
        {(this.props.showDetails == true) &&
          <Card.Item >
            <Stack padding="12px 0 0" verticalAlign={'start'} >
              {!this.props.tbd && <ActivityItem
                key={`${this.props.flight_number}-launch}`}
                activityIcon={icons.Rocket}
                activityDescription={`Launched at ${moment(this.props.launch_date_local).format('YYYY-MM-DD')} from ${this.props.launch_site.site_name_long} `}
                {...aiProps} />
              }
              {this.props.tbd && <ActivityItem
                key={`${this.props.flight_number}-launch}`}
                isCompact={true}
                activityIcon={icons.Rocket}
                activityDescription={`Launch is planned at ${moment(this.props.launch_date_local).format('YYYY-MM-DD')} from ${this.props.launch_site.site_name_long} `}
                {...aiProps} />
              }
              {(!this.props.tbd && this.props.rocket.second_stage && this.props.rocket.second_stage.payloads) &&
                this.props.rocket.second_stage.payloads.map((payload, idx) => {
                  let desc = payload.payload_id;
                  if (payload.manufacturer) {
                    desc += ` by ${payload.manufacturer}`;
                  }
                  if (payload.nationality) {
                    desc += ` from ${payload.nationality}`;
                  }
                  if (payload.orbit) {
                    desc += ` into ${payload.orbit}`;
                  }
                  return (
                    <ActivityItem
                      key={`${this.props.flight_number}-${idx}`}
                      isCompact={true}
                      activityIcon={icons[payload.payload_type]}
                      activityDescription={desc}
                      {...aiProps} />
                  );
                })
              }
              {!this.props.tbd && this.props.rocket.first_stage.cores.map((core, idx) => {
                let desc = "";
                let icon: JSX.Element;
                if (core.land_success) {
                  switch (core.landing_type) {
                    case "RTLS":
                      desc = `Core ${core.core_serial} returned safely to ${core.landing_vehicle}`;
                      break;
                    case "ASDS":
                      desc = `Core ${core.core_serial} landed on ${core.landing_vehicle}`;
                      break;
                    case "Ocean":
                      desc = `Core ${core.core_serial} landed in the Ocean`;
                      break;
                  }
                  icon = <Icon iconName={'Medal'} />;
                } else if (core.landing_intent) {
                  switch (core.landing_type) {
                    case "RTLS":
                      desc = `Core ${core.core_serial} failed to return to ${core.landing_vehicle}`;
                      break;
                    case "ASDS":
                      desc = `Core ${core.core_serial} failed to land on ${core.landing_vehicle}`;
                      break;
                    case "Ocean":
                      desc = `Core ${core.core_serial} lost in the Ocean`;
                      break;
                  }
                  icon = <Icon iconName={'Broom'} />;
                } else {
                  desc = `No landing attempt for core ${core.core_serial}`;
                  icon = <Icon iconName={'Info'} />;
                }

                return <ActivityItem
                  key={`${this.props.flight_number}-core-${idx}}`}
                  isCompact={true}
                  activityIcon={icon}
                  activityDescription={desc}
                  {...aiProps} />;
              })}

              {(!this.props.tbd && this.props.launch_success) && (
                <ActivityItem
                  key={`${this.props.flight_number}-success}`}
                  isCompact={true}
                  activityIcon={icons.Success}
                  activityDescription={`Launch was successful `}
                  {...aiProps} />

              )}
              {(!this.props.tbd && !this.props.launch_success) && (
                <ActivityItem
                  key={`${this.props.flight_number}-fail}`}
                  isCompact={true}
                  activityIcon={icons.Failure}
                  activityDescription={`Mission was a failure `}
                  {...aiProps} />
              )}
            </Stack>
          </Card.Item>
        }
      </Card>
    );
  }
}
