import Orionx from "orionx-sdk";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  ORIONX_ENDPOINT: string;
  ORIONX_API_KEY: string;
  ORIONX_SECRET_KEY: string;
}
const preferences = getPreferenceValues<Preferences>();

Orionx.setCredentials({
  apiKey: preferences["ORIONX_API_KEY"],
  apiUri: preferences["ORIONX_ENDPOINT"],
  secretKey: preferences["ORIONX_SECRET_KEY"],
});

export default Orionx;
