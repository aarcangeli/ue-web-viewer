import type { AssetReader } from "../AssetReader";
import { EUnrealEngineObjectUE4Version } from "../versioning/ue-versions";
import invariant from "tiny-invariant";

/**
 * This class represents a text with additional metadata to localize it.
 *
 * A text is a recursive data structure with various types.
 *
 * The most basic form is a base string {@link FTextHistory_Base} but it can also be:
 * - formatted text (e.g. "Hello {0}!" and "Hello {Who}!")
 * - numbers (e.g. "1234" and "66%", "$1.25")
 * - date and time (e.g. "Tuesday, 15 May 2018" and "02:00:00 CEST")
 * - a transformation (e.g. "Hello World!" => "HELLO WORLD!")
 *
 * Parameters can be numbers, genders (!?), or other texts.
 *
 * For simplicity, we only support the base form for now.
 */
export class FText {
  constructor(
    public flags: number,
    public textHistoryType: ETextHistoryType,
    public textData: ITextData,
  ) {}

  static fromStream(reader: AssetReader): FText {
    // from FText::SerializeText
    let historyType: ETextHistoryType = ETextHistoryType.None;
    let textData: ITextData | null = null;

    if (reader.fileVersionUE4 < EUnrealEngineObjectUE4Version.VER_UE4_FTEXT_HISTORY) {
      // History not available
      const sourceString = reader.readString();
      let namespace = reader.readString();
      let key = reader.readString();
      if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_ADDED_NAMESPACE_AND_KEY_DATA_TO_FTEXT) {
        namespace = reader.readString();
        key = reader.readString();
      }
      historyType = ETextHistoryType.Base;
      textData = new FTextHistory_Base(namespace, key, sourceString);
    }

    const flags = reader.readUInt32();

    if (reader.fileVersionUE4 >= EUnrealEngineObjectUE4Version.VER_UE4_FTEXT_HISTORY) {
      historyType = reader.readUInt8() as ETextHistoryType;
      switch (historyType) {
        case ETextHistoryType.Base:
          textData = FTextHistory_Base.fromStream(reader);
          break;
        default:
          // There is much more to this, but we don't need it right now
          throw new Error(`Unknown history type: ${historyType}`);
      }
    }

    invariant(textData);
    return new FText(flags, historyType, textData);
  }

  toString() {
    return this.textData.getSourceString();
  }
}

export enum ETextHistoryType {
  // es: INVTEXT("asdasd")
  None = -1,
  // es: NSLOCTEXT("[3A4CBA0B4DAA8ACF36B596A48B42C55B]", "571AC91C434ED6B6D9DFF1969AE3828B", "Hello!") => "Hello!"
  Base = 0,
  // es: LOCGEN_FORMAT_NAMED("Hello {Who}!", "Who", "World") => "Hello World!"
  NamedFormat,
  // es: LOCGEN_FORMAT_ORDERED("Hello {0}!", "World") => "Hello World!"
  OrderedFormat,
  ArgumentFormat,
  // es: LOCGEN_NUMBER(1234, "en") => "1,234"
  AsNumber,
  // es: LOCGEN_PERCENT(0.44, "en") => "44%"
  AsPercent,
  // es: LOCGEN_CURRENCY(125, "USD", "en") => "$1.25"
  AsCurrency,
  // es: LOCGEN_DATE_UTC(1526342400, EDateTimeStyle::Full, "en", "en-GB") => "Tuesday, 15 May 2018"
  AsDate,
  // es: LOCGEN_TIME_UTC(1526342400, EDateTimeStyle::Long, "en", "en-GB") => "02:00:00 CEST"
  AsTime,
  // LOCGEN_DATETIME_UTC(1526342400, EDateTimeStyle::Long, EDateTimeStyle::Long, "en", "en-GB") => "15 May 2018 at 02:00:00 CEST"
  AsDateTime,
  // ???
  Transform,
  // es: LOCTABLE("/Game/NewStringTable.NewStringTable", "key")
  StringTableEntry,
  // ???
  TextGenerator,
}

export interface ITextData {
  getSourceString(): string;
}

export class FTextHistory_Base implements ITextData {
  constructor(
    public namespace: string | null,
    public key: string | null,
    public sourceString: string,
  ) {}

  static fromStream(reader: AssetReader) {
    const namespace = reader.readString();
    const key = reader.readString();
    const sourceString = reader.readString();
    return new FTextHistory_Base(namespace, key, sourceString);
  }

  getSourceString() {
    return this.sourceString;
  }
}
