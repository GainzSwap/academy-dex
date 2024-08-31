import moment from "moment";

interface FormattersType {
  [key: string]: any;
  d: Array<string | number>;
  h: Array<string | number>;
  m: Array<string | number>;
  s: Array<string | number>;
}

export const formatTime = (secs: number) => {
  const duration = moment.duration(secs, "seconds");

  const formatters: FormattersType = {
    d: [duration.asDays(), Math.floor(duration.asDays())],
    h: [duration.asHours(), "H"],
    m: [duration.asMinutes(), "m"],
    s: [duration.asSeconds(), "s"],
  };

  const format = Object.keys(formatters).reduce((total, key) => {
    const [time, label] = formatters[key];

    if (Math.floor(time) > 0) {
      return total === "" ? `${label}[${key}]` : `${total} ${label}[${key}]`;
    }

    return total;
  }, "");

  return moment.utc(moment.duration(secs, "seconds").asMilliseconds()).format(format);
};
