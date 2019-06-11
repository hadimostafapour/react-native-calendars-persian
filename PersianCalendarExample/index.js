import React, { Component } from "react";
import { View } from "react-native";
import { Calendar } from "react-native-calendars-persian";
import theme from "./theme";

export default class PersianCalendarExample extends Component {
  componentWillMount() {
    // mark fridays before components render
    let d = new Date();
    this._renderDays(d.toISOString().slice(0, 10));
  }

  state = {
    fridays: [],
    selected: null,
    darkTheme: false,
    weekNumber: true
  };

  render() {
    const { darkTheme, weekNumber } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <Calendar
          jalali
          firstDay={6}
          rtl={true}
          hideExtraDays
          showWeekNumbers={weekNumber}
          theme={darkTheme ? theme.dark : theme.light}
          onDayPress={day => this.setState({ selected: day.dateString })}
          onMonthChange={month => {
            this._renderDays(month.dateString);
          }}
          markingType="custom"
          markedDates={{
            ...this.state.fridays,
            [this.state.selected]: { selected: true }
          }}
        />
      </View>
    );
  }

  // mark fridays
  _renderDays = date => {
    let da = new Date(date);
    let oneDay = 24 * 60 * 60 * 1000;
    let temp = new Date();
    let fridays = [];
    let tempDate = "";
    for (let day = -31; day < 31; day++) {
      temp = new Date(da.valueOf() + day * oneDay);
      if (temp.getDay() == 5) {
        tempDate = temp.toISOString().slice(0, 10);
        fridays[tempDate] = {
          customStyles: {
            text: {
              fontSize: 32,
              fontWeight: "600",
              color: "red"
            }
          }
        };
      }
    }
    this.setState({ fridays: fridays });
  };
}
