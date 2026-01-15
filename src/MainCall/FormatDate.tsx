export default function FormatDate(data) {
  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  const d = new Date(data);
  const date_format =
    d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + " ";
  return date_format;
}
