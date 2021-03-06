import React, { Component } from "react";
import PropTypes from "prop-types";

import { observer } from "mobx-react";

import { APIGroup } from "Models/API";
import { StaticLabels } from "Common/Query";
import { FilteringLabel } from "Components/Labels/FilteringLabel";
import { RenderNonLinkAnnotation, RenderLinkAnnotation } from "../Annotation";

const GroupFooter = observer(
  class GroupFooter extends Component {
    static propTypes = {
      group: APIGroup.isRequired,
      alertmanagers: PropTypes.arrayOf(PropTypes.string).isRequired,
      afterUpdate: PropTypes.func.isRequired
    };

    render() {
      const { group, alertmanagers, afterUpdate } = this.props;

      return (
        <div className="card-footer px-2 py-1">
          <div className="mb-1">
            {group.shared.annotations
              .filter(a => a.isLink === false)
              .map(a => (
                <RenderNonLinkAnnotation
                  key={a.name}
                  name={a.name}
                  value={a.value}
                  visible={a.visible}
                  afterUpdate={afterUpdate}
                />
              ))}
          </div>
          {Object.entries(group.shared.labels).map(([name, value]) => (
            <FilteringLabel key={name} name={name} value={value} />
          ))}
          {alertmanagers.map(am => (
            <FilteringLabel
              key={am}
              name={StaticLabels.AlertManager}
              value={am}
            />
          ))}
          <FilteringLabel name={StaticLabels.Receiver} value={group.receiver} />
          {group.shared.annotations
            .filter(a => a.isLink === true)
            .map(a => (
              <RenderLinkAnnotation
                key={a.name}
                name={a.name}
                value={a.value}
              />
            ))}
        </div>
      );
    }
  }
);

export { GroupFooter };
