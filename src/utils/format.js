import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

export const rupiah = (value) => {
  if (value === null || value === undefined) return "-";

  return `Rp ${Number(value).toLocaleString("id-ID")}`;
};

export const formatDate = (value) =>
  value ? dayjs(value).format("D MMMM YYYY") : "-";

export const formatDateTime = (value) =>
  value ? dayjs(value).format("D MMM YYYY, HH:mm") : "-";

export const daysLeft = (value) => {
  if (!value) return null;

  return dayjs(value).startOf("day").diff(dayjs().startOf("day"), "day");
};
