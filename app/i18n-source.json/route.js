import { UI } from "lib/i18n";

// The string table site-api translates into every language (see lib/i18n.js).
export const dynamic = "force-static";
export function GET() {
 return Response.json(UI);
}
