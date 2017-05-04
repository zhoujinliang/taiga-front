import { Action } from "@ngrx/store";
import * as Immutable from "immutable";

export class FetchWikiPageAction implements Action {
  readonly type = "FETCH_WIKI_PAGE";
  payload:any;

  constructor(projectId: number, slug: string) {
      this.payload = {projectId, slug};
  }
}

export class FetchWikiPagesListAction implements Action {
  readonly type = "FETCH_WIKI_PAGES_LIST";

  constructor(public payload: number) {}
}

export class FetchWikiPageHistoryAction implements Action {
  readonly type = "FETCH_WIKI_PAGE_HISTORY";

  constructor(public payload: number) {}
}

export class FetchWikiPageAttachmentsAction implements Action {
  readonly type = "FETCH_WIKI_PAGE_ATTACHMENTS";
  payload:any;

  constructor(projectId: number, wikiId: string) {
      this.payload = {projectId, wikiId};
  }
}

export class FetchWikiLinksAction implements Action {
  readonly type = "FETCH_WIKI_LINKS";

  constructor(public payload: number) {}
}

export class ModifyWikiPageAction implements Action {
  readonly type = "MODIFY_WIKI_PAGE";
  payload:any;

  constructor(projectId: number, page: Immutable.Map<string, any>) {
      this.payload = {projectId, page};
  }
}

export class DeleteWikiPageAction implements Action {
  readonly type = "DELETE_WIKI_PAGE";
  payload:any;

  constructor(projectId: number, slug: string) {
      this.payload = {projectId, slug};
  }
}

export class SetWikiPageAction implements Action {
  readonly type = "SET_WIKI_PAGE";

  constructor(public payload: Immutable.Map<string, any>) {}
}

export class SetWikiPagesListAction implements Action {
  readonly type = "SET_WIKI_PAGES_LIST";

  constructor(public payload: Immutable.List<any>) {}
}

export class SetWikiPageHistoryAction implements Action {
  readonly type = "SET_WIKI_PAGE_HISTORY";

  constructor(public payload: Immutable.List<any>) {}
}

export class SetWikiPageAttachmentsAction implements Action {
  readonly type = "SET_WIKI_PAGE_ATTACHMENTS";

  constructor(public payload: Immutable.List<any>) {}
}

export class SetWikiLinksAction implements Action {
  readonly type = "SET_WIKI_LINKS";

  constructor(public payload: Immutable.List<any>) {}
}

export class DeleteWikiLinkAction implements Action {
  readonly type = "DELETE_WIKI_LINK";
  payload: any;

  constructor(projectId: number, slug: string) {
      this.payload = {projectId, slug};
  }
}
