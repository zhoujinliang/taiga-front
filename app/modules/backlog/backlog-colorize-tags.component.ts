import {Component, Input} from "@angular/core";

@Component({
  selector: "tg-backlog-colorize-tag",
  styles: ["h1 { font-weight: normal; }"],
  template: `
      <span
          class="tag"
          [style.border-left]="getBorder()"
          title="{{name}}">
          {{name}}
      </span>
  `,
})
export class BacklogColorizeTag {
    @Input("name") name: any = [];
    @Input("color") color: any = [];

    getBorder() {
        if (this.color === null) {
            return "";
        }
        return `5px solid ${this.color}`;
    }
}

@Component({
  selector: "tg-backlog-colorize-tags",
  template: `
     <tg-backlog-colorize-tag
        *ngFor="let tag of tags"
        [name]="tag.get(0)"
        [color]="tag.get(1)">
     </tg-backlog-colorize-tag>
  `,
})
export class BacklogColorizeTags {
    @Input("tags") tags: any = [];
}
