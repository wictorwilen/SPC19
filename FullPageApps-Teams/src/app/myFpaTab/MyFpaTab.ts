import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/myFpaTab/index.html")
@PreventIframe("/myFpaTab/config.html")
@PreventIframe("/myFpaTab/remove.html")
export class MyFpaTab {
}
