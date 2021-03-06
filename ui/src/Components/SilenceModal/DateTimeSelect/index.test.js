import React from "react";

import { mount, shallow } from "enzyme";

import { advanceTo, clear } from "jest-date-mock";

import moment from "moment";

import { SilenceFormStore } from "Stores/SilenceFormStore";
import {
  DateTimeSelect,
  TabContentStart,
  TabContentEnd,
  TabContentDuration
} from ".";

let silenceFormStore;

beforeEach(() => {
  silenceFormStore = new SilenceFormStore();
  silenceFormStore.data.startsAt = moment([2060, 1, 1, 0, 0, 0]);
  silenceFormStore.data.endsAt = moment([2061, 1, 1, 0, 0, 0]);
});

afterEach(() => {
  clear();
});

const ShallowDateTimeSelect = () => {
  return shallow(<DateTimeSelect silenceFormStore={silenceFormStore} />);
};

const MountedDateTimeSelect = () => {
  return mount(<DateTimeSelect silenceFormStore={silenceFormStore} />);
};

describe("<DateTimeSelect />", () => {
  it("renders 3 tabs", () => {
    const tree = ShallowDateTimeSelect();
    const tabs = tree.find("Tab");
    expect(tabs).toHaveLength(3);
  });

  it("renders 'Duration' tab by default", () => {
    const tree = MountedDateTimeSelect();
    const tab = tree.find(".nav-link.active");
    expect(tab).toHaveLength(1);
    // check tab title
    expect(tab.text()).toMatch(/Duration/);
    // check tab content
    expect(tree.find(".tab-content").text()).toBe("366days0hours0minutes");
  });

  it("clicking on the 'Starts' tab switches content to 'startsAt' selection", () => {
    const tree = MountedDateTimeSelect();
    const tab = tree.find(".nav-link").at(0);
    expect(tab.text()).toMatch(/Starts/);
    tab.simulate("click");
    expect(tree.find(".tab-content").text()).toMatch(/2060/);
  });

  it("clicking on the 'Ends' tab switches content to 'endsAt' selection", () => {
    const tree = MountedDateTimeSelect();
    const tab = tree.find(".nav-link").at(1);
    expect(tab.text()).toMatch(/Ends/);
    tab.simulate("click");
    expect(tree.find(".tab-content").text()).toMatch(/2061/);
  });

  it("clicking on the 'Duration' tabs switches content to duration selection", () => {
    const tree = MountedDateTimeSelect();
    // first switch to 'Starts'
    tree
      .find(".nav-link")
      .at(0)
      .simulate("click");
    // then switch back to 'Duration'
    const tab = tree.find(".nav-link").at(2);
    expect(tab.text()).toMatch(/Duration/);
    tab.simulate("click");
    expect(tree.find(".tab-content").text()).toBe("366days0hours0minutes");
  });

  it("'Ends' tab offset badge is updated after 1 minute", () => {
    jest.useFakeTimers();
    advanceTo(new Date(2060, 1, 1, 12, 0, 0));
    silenceFormStore.data.startsAt = moment([2060, 1, 1, 12, 0, 0]);
    silenceFormStore.data.endsAt = moment([2060, 1, 1, 13, 0, 0]);

    const tree = MountedDateTimeSelect();
    expect(
      tree
        .find(".nav-link")
        .at(1)
        .text()
    ).toBe("Endsin 1h ");

    advanceTo(new Date(2060, 1, 1, 12, 1, 0));
    jest.runOnlyPendingTimers();

    expect(
      tree
        .find(".nav-link")
        .at(1)
        .text()
    ).toBe("Endsin 59m ");
  });

  it("nowUpdateTimer is destroyed before unmount", () => {
    const tree = MountedDateTimeSelect();
    const instance = tree.instance();
    expect(instance.nowUpdateTimer).toBeDefined();
    instance.componentWillUnmount();
    expect(instance.nowUpdateTimer).toBeNull();
  });
});

const ValidateTimeButton = (
  tab,
  storeKey,
  elemIndex,
  iconMatch,
  expectedDiff
) => {
  const button = tab.find("td > span").at(elemIndex);
  expect(button.html()).toMatch(iconMatch);

  const oldTimeValue = moment(silenceFormStore.data[storeKey]);
  button.simulate("click");
  expect(silenceFormStore.data[storeKey].toISOString()).not.toBe(
    oldTimeValue.toISOString()
  );
  const diffMS = silenceFormStore.data[storeKey].diff(oldTimeValue);
  expect(diffMS).toBe(expectedDiff);
};

const ShallowTabContentStart = () => {
  return shallow(<TabContentStart silenceFormStore={silenceFormStore} />);
};

const MountedTabContentStart = () => {
  return mount(<TabContentStart silenceFormStore={silenceFormStore} />);
};

describe("<TabContentStart />", () => {
  it("selecting date on DatePicker updates startsAt", () => {
    const tree = ShallowTabContentStart();
    const picker = tree.find("DatePicker");
    const startsAt = moment([2063, 10, 10, 0, 1, 2]);
    picker.simulate("change", startsAt);
    expect(silenceFormStore.data.startsAt.toISOString()).toBe(
      startsAt.toISOString()
    );
  });

  it("clicking on the hour inc button adds 1h to startsAt", () => {
    const tree = MountedTabContentStart();
    ValidateTimeButton(tree, "startsAt", 0, /angle-up/, 3600 * 1000);
  });

  it("clicking on the minute inc button adds 1m to startsAt", () => {
    const tree = MountedTabContentStart();
    ValidateTimeButton(tree, "startsAt", 1, /angle-up/, 60 * 1000);
  });

  it("clicking on the hour dec button subtracts 1h from startsAt", () => {
    const tree = MountedTabContentStart();
    ValidateTimeButton(tree, "startsAt", 2, /angle-down/, -1 * 3600 * 1000);
  });

  it("clicking on the minute dec button subtracts 1m from startsAt", () => {
    const tree = MountedTabContentStart();
    ValidateTimeButton(tree, "startsAt", 3, /angle-down/, -1 * 60 * 1000);
  });
});

const ShallowTabContentEnd = () => {
  return shallow(<TabContentEnd silenceFormStore={silenceFormStore} />);
};

const MountedTabContentEnd = () => {
  return mount(<TabContentEnd silenceFormStore={silenceFormStore} />);
};

describe("<TabContentEnd />", () => {
  it("Selecting date on DatePicker updates endsAt", () => {
    const tree = ShallowTabContentEnd();
    const picker = tree.find("DatePicker");
    const endsAt = moment([2063, 11, 5, 1, 3, 2]);
    picker.simulate("change", endsAt);
    expect(silenceFormStore.data.endsAt.toISOString()).toBe(
      endsAt.toISOString()
    );
  });

  it("clicking on the hour inc button adds 1h to endsAt", () => {
    const tree = MountedTabContentEnd();
    ValidateTimeButton(tree, "endsAt", 0, /angle-up/, 3600 * 1000);
  });

  it("clicking on the minute inc button adds 1m to endsAt", () => {
    const tree = MountedTabContentEnd();
    ValidateTimeButton(tree, "endsAt", 1, /angle-up/, 60 * 1000);
  });

  it("clicking on the hour dec button subtracts 1h from endsAt", () => {
    const tree = MountedTabContentEnd();
    ValidateTimeButton(tree, "endsAt", 2, /angle-down/, -1 * 3600 * 1000);
  });

  it("clicking on the minute dec button subtracts 1m from endsAt", () => {
    const tree = MountedTabContentEnd();
    ValidateTimeButton(tree, "endsAt", 3, /angle-down/, -1 * 60 * 1000);
  });
});

const ValidateDurationButton = (elemIndex, iconMatch, expectedDiff) => {
  const tree = mount(
    <TabContentDuration silenceFormStore={silenceFormStore} />
  );
  const button = tree.find("td > span").at(elemIndex);
  expect(button.html()).toMatch(iconMatch);

  const oldEndsAt = moment(silenceFormStore.data.endsAt);
  button.simulate("click");
  expect(silenceFormStore.data.endsAt.toISOString()).not.toBe(
    oldEndsAt.toISOString()
  );
  const diffMS = silenceFormStore.data.endsAt.diff(oldEndsAt);
  expect(diffMS).toBe(expectedDiff);
};

describe("<TabContentDuration />", () => {
  it("clicking on the day inc button adds 1d to endsAt", () => {
    ValidateDurationButton(0, /angle-up/, 24 * 3600 * 1000);
  });

  it("clicking on the day dec button subtracts 1d from endsAt", () => {
    ValidateDurationButton(2, /angle-down/, -1 * 24 * 3600 * 1000);
  });

  it("clicking on the hour inc button adds 1h to endsAt", () => {
    ValidateDurationButton(3, /angle-up/, 3600 * 1000);
  });

  it("clicking on the hour dec button subtracts 1h from endsAt", () => {
    ValidateDurationButton(5, /angle-down/, -1 * 3600 * 1000);
  });

  it("clicking on the minute inc button adds 5m to endsAt", () => {
    ValidateDurationButton(6, /angle-up/, 5 * 60 * 1000);
  });

  it("clicking on the minute dec button subtracts 5m from endsAt", () => {
    ValidateDurationButton(8, /angle-down/, -1 * 5 * 60 * 1000);
  });
});

const SetDurationTo = (hours, minutes) => {
  const startsAt = moment([2060, 1, 1, 0, 0, 0]);
  const endsAt = moment(startsAt)
    .add(hours, "hours")
    .add(minutes, "minutes");
  silenceFormStore.data.startsAt = startsAt;
  silenceFormStore.data.endsAt = endsAt;
};

describe("<TabContentDuration /> inc minute CalculateChangeValue", () => {
  it("inc on 0:1:0 duration sets 0:1:5", () => {
    SetDurationTo(1, 0);
    ValidateDurationButton(6, /angle-up/, 5 * 60 * 1000);
  });

  it("inc on 0:1:1 duration sets 0:1:2", () => {
    SetDurationTo(1, 1);
    ValidateDurationButton(6, /angle-up/, 60 * 1000);
  });

  it("inc on 0:1:4 duration sets 0:1:5", () => {
    SetDurationTo(1, 4);
    ValidateDurationButton(6, /angle-up/, 60 * 1000);
  });

  it("inc on 0:1:5 duration sets 0:1:10", () => {
    SetDurationTo(1, 5);
    ValidateDurationButton(6, /angle-up/, 5 * 60 * 1000);
  });

  it("inc on 0:1:6 duration sets 0:1:10", () => {
    SetDurationTo(1, 6);
    ValidateDurationButton(6, /angle-up/, 4 * 60 * 1000);
  });

  it("inc on 0:0:55 duration sets 0:1:0", () => {
    SetDurationTo(0, 55);
    ValidateDurationButton(6, /angle-up/, 5 * 60 * 1000);
  });
});

describe("<TabContentDuration /> dec minute CalculateChangeValue", () => {
  it("inc on 0:1:0 duration sets 0:0:55", () => {
    SetDurationTo(1, 0);
    ValidateDurationButton(8, /angle-down/, -5 * 60 * 1000);
  });

  it("inc on 0:0:59 duration sets 0:0:55", () => {
    SetDurationTo(0, 59);
    ValidateDurationButton(8, /angle-down/, -4 * 60 * 1000);
  });

  it("inc on 0:0:56 duration sets 0:0:55", () => {
    SetDurationTo(0, 56);
    ValidateDurationButton(8, /angle-down/, -1 * 60 * 1000);
  });

  it("inc on 0:0:55 duration sets 0:0:50", () => {
    SetDurationTo(1, 0);
    ValidateDurationButton(8, /angle-down/, -5 * 60 * 1000);
  });

  it("inc on 0:1:10 duration sets 0:1:5", () => {
    SetDurationTo(1, 10);
    ValidateDurationButton(8, /angle-down/, -5 * 60 * 1000);
  });

  it("inc on 0:1:6 duration sets 0:1:5", () => {
    SetDurationTo(1, 6);
    ValidateDurationButton(8, /angle-down/, -1 * 60 * 1000);
  });

  it("inc on 0:1:5 duration sets 0:1:0", () => {
    SetDurationTo(1, 5);
    ValidateDurationButton(8, /angle-down/, -5 * 60 * 1000);
  });

  it("inc on 0:1:4 duration sets 0:1:3", () => {
    SetDurationTo(1, 4);
    ValidateDurationButton(8, /angle-down/, -1 * 60 * 1000);
  });

  it("inc on 0:1:1 duration sets 0:1:0", () => {
    SetDurationTo(1, 1);
    ValidateDurationButton(8, /angle-down/, -1 * 60 * 1000);
  });
});
