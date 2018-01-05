class DateModel {
  constructor ({startDate, endDate, allDay}) {
    this._startDate = startDate
    this._endDate = endDate
    this._allDay = allDay
  }

  /**
   * (!) startDate and endDate are not in German, but UTC-Timezone. They are sent in German timezone by Server, but without any
   * timezone declaration, so we don't know if it's DaylightSavingTime or not. So we parse it in UTC and display it in UTC.
   * @return {Date} the Date when the event ends. If it's not specified, then null. Must be displayed in UTC-Timezone.
   */
  get startDate () {
    return this._startDate
  }

  /**
   * @return {Date} the Date when the event starts. Must be displayed in UTC-Timezone.
   */
  get endDate () {
    return this._endDate
  }

  /** @return {boolean} true, if event is all day long. */
  get allDay () {
    return this._allDay
  }

  toLocaleString (locale) {
    this._startDate.locale(locale)
    this._endDate.locale(locale)

    let span = ''

    if (this.allDay) {
      span += this.startDate.format('LL')

      if (!this.startDate.isSame(this.endDate)) {
        span += ' - ' + this.endDate.format('LL')
      }
    } else {
      span += this.startDate.format('LLL')

      if (!this.startDate.isSame(this.endDate)) {
        span += ' - ' + this.endDate.format('LLL')
      }
    }
    return span
  }
}

export default DateModel
