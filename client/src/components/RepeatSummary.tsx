import { format } from "date-fns";
import { TransactionRepeatType } from "../server-api";
import { useAppSelector } from "../state/hooks";

const ConvertRepeatTypeToHuman = (repeatType: TransactionRepeatType) => {
  switch (repeatType) {
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "yearly":
      return "year";
  }
};

const ConvertRepeatLogicToHumanText = (
  date: Date,
  repeatType: TransactionRepeatType,
  occurrences: number,
  repeatEndType?: "after" | "on" | "never",
  repeatEndDate?: Date,
  repeatEndOccurrences?: number
) => {
  let text = "Every ";

  const repeatTypeText = ConvertRepeatTypeToHuman(repeatType);

  if (occurrences > 1) {
    text += `${occurrences} ${repeatTypeText}s`;
  } else {
    text += repeatTypeText;
  }

  let dateFormat: string = null;

  if (repeatType === "weekly") {
    dateFormat = "EEEE";
  }

  if (repeatType === "monthly") {
    dateFormat = "'the' do";
  }

  if (repeatType === "yearly") {
    dateFormat = "MMMM 'the' do";
  }

  if (repeatType && repeatType !== "daily") {
    text += ` (on ${format(date, dateFormat)})`;
  }

  if (repeatEndType === "on" && repeatEndDate) {
    text += `, until ${format(repeatEndDate, "MMMM dd yyyy")}`;
  }

  if (repeatEndType === "after" && repeatEndOccurrences) {
    text += `, ${repeatEndOccurrences} time${
      repeatEndOccurrences > 1 ? "s" : ""
    }`;
  }

  return text;
};

const RepeatSummary = () => {
  const {
    transactionDate,
    repeat,
    repeatEvery,
    repeatEndType,
    repeatEndDate,
    repeatEndOccurrences,
  } = useAppSelector((state) => state.addOrEditTransactionReducer);

  const customRepeatLogicInHuman = ConvertRepeatLogicToHumanText(
    new Date(transactionDate),
    repeat,
    repeatEvery,
    repeatEndType ?? "never",
    repeatEndType === "on" ? new Date(repeatEndDate) : undefined,
    repeatEndType === "after" ? repeatEndOccurrences : undefined
  );

  return (
    <div className="ml-3">
      <span className="uppercase text-xs mb-1">Summary</span>
      <p className="h-14">{customRepeatLogicInHuman}</p>
    </div>
  );
};

export default RepeatSummary;
